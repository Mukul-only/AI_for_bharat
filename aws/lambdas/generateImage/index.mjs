import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
const BUCKET = process.env.ASSETS_BUCKET;

const STYLE_MODIFIERS = {
  photorealistic: "photorealistic, professional photography, high quality",
  illustration: "digital illustration, vibrant colors, modern art",
  minimal: "minimalist design, clean, flat design",
  abstract: "abstract art, bold colors, geometric shapes",
};

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { seedText, style = "photorealistic" } = body;

    if (!seedText) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "seedText is required" }),
      };
    }

    const styleText = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.photorealistic;

    // ── Step 1: Use Claude to craft an optimized image prompt ──
    let craftedPrompt;
    try {
      const promptCommand = new InvokeModelCommand({
        modelId: "anthropic.claude-3-haiku-20240307-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `You are an expert image prompt engineer. Given the following content text, create a concise, vivid image generation prompt that captures the essence and mood of the content. The prompt should describe a specific visual scene, composition, lighting, and atmosphere. Do NOT include any text or words to be rendered in the image. Keep the prompt under 100 words. Output ONLY the image prompt, nothing else.

Style direction: ${styleText}

Content text:
${seedText.slice(0, 800)}`,
            },
          ],
        }),
      });

      console.log("Calling Claude to craft image prompt...");
      const promptResponse = await bedrock.send(promptCommand);
      const promptResult = JSON.parse(
        new TextDecoder().decode(promptResponse.body),
      );
      craftedPrompt = promptResult.content[0].text.trim();
      console.log("AI-crafted prompt:", craftedPrompt);
    } catch (promptErr) {
      console.warn(
        "Claude prompt crafting failed, using fallback:",
        promptErr.message,
      );
      // Fallback: use truncated seed text with style
      craftedPrompt = `${seedText.slice(0, 400)}. ${styleText}`;
    }

    const fullPrompt = `${craftedPrompt}. ${styleText}`;
    console.log("Final image prompt:", fullPrompt);

    // ── Step 2: Generate image using Titan with the crafted prompt ──
    const imageCommand = new InvokeModelCommand({
      modelId: "amazon.titan-image-generator-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        taskType: "TEXT_IMAGE",
        textToImageParams: { text: fullPrompt },
        imageGenerationConfig: {
          numberOfImages: 1,
          width: 1024,
          height: 1024,
          cfgScale: 8.0,
          seed: Math.floor(Math.random() * 2147483647),
        },
      }),
    });

    console.log("Calling Titan Image Generator v2...");
    const imageResponse = await bedrock.send(imageCommand);
    const imageResult = JSON.parse(
      new TextDecoder().decode(imageResponse.body),
    );
    const imageBase64 = imageResult.images[0];
    console.log("Image generated, size:", imageBase64.length);

    // Save to S3
    const imageId = randomUUID();
    const key = `public/generated/${imageId}.png`;
    const imageBuffer = Buffer.from(imageBase64, "base64");

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: imageBuffer,
        ContentType: "image/png",
      }),
    );

    const imageUrl = `https://${BUCKET}.s3.amazonaws.com/${key}`;
    console.log("Image saved to:", imageUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        imageUrl,
        prompt: fullPrompt,
        craftedPrompt,
        model: "amazon.titan-image-generator-v2:0",
        style,
      }),
    };
  } catch (err) {
    console.error(
      "Image generation error:",
      JSON.stringify({
        message: err.message,
        name: err.name,
        code: err.$metadata?.httpStatusCode,
      }),
    );
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

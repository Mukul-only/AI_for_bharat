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

async function generateImagePrompt(seedText) {
  // Use Claude 3 Haiku to create a detailed image generation prompt
  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Based on the following content, create a detailed image generation prompt for an AI image generator. The prompt should describe a visually striking, professional image that could be used as a social media header or blog thumbnail. Focus on visual elements, colors, compositions, and mood. Output ONLY the image prompt, nothing else.

Content:
${seedText.slice(0, 2000)}`,
        },
      ],
      temperature: 0.8,
    }),
  });

  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text;
}

const STYLE_MODIFIERS = {
  photorealistic:
    "photorealistic, high resolution, professional photography, studio lighting",
  illustration:
    "digital illustration, clean lines, vibrant colors, modern art style",
  minimal:
    "minimalist design, clean, simple shapes, lots of white space, flat design",
  abstract:
    "abstract art, bold colors, geometric shapes, modern abstract composition",
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

    // Step 1: Generate a detailed image prompt using Haiku
    const imagePrompt = await generateImagePrompt(seedText);
    const fullPrompt = `${imagePrompt}. Style: ${STYLE_MODIFIERS[style] || STYLE_MODIFIERS.photorealistic}`;

    // Step 2: Generate image with Titan Image Generator v2
    const imageCommand = new InvokeModelCommand({
      modelId: "amazon.titan-image-generator-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        textToImageParams: {
          text: fullPrompt,
        },
        imageGenerationConfig: {
          numberOfImages: 1,
          width: 1024,
          height: 576,
          cfgScale: 8.0,
          seed: Math.floor(Math.random() * 2147483647),
        },
      }),
    });

    const imageResponse = await bedrock.send(imageCommand);
    const imageResult = JSON.parse(
      new TextDecoder().decode(imageResponse.body),
    );
    const imageBase64 = imageResult.images[0];

    // Step 3: Save to S3
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        imageUrl,
        prompt: fullPrompt,
        model: "titan-image-generator-v2",
        style,
      }),
    };
  } catch (err) {
    console.error("Image generation error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

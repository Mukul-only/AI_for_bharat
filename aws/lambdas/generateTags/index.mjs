import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MODELS_TO_TRY = [
  "us.anthropic.claude-3-haiku-20240307-v1:0",
  "us.amazon.nova-lite-v1:0",
  "amazon.titan-text-express-v1",
];

async function callModel(messages, maxTokens = 1024) {
  for (const modelId of MODELS_TO_TRY) {
    try {
      const command = new ConverseCommand({
        modelId,
        messages,
        inferenceConfig: { maxTokens },
      });
      const response = await client.send(command);
      return response.output.message.content[0].text;
    } catch (err) {
      console.warn(`Model ${modelId} failed: ${err.message}`);
    }
  }
  throw new Error("All models failed.");
}

export const handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body || "{}");
    if (!text || !text.trim()) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: "text is required" }),
      };
    }

    const prompt = `You are a content analysis expert. Analyze the following text and return a JSON object with:
- "hashtags": array of 8-12 relevant hashtags (with # prefix), ordered by relevance
- "categories": array of 3 categories that best describe this content  
- "keywords": array of 5 SEO-friendly long-tail keywords
- "readingLevel": one of "Beginner", "Intermediate", or "Advanced"
- "estimatedReadTime": estimated read time as a string like "5 min read"

Return ONLY valid JSON, no other text.

Text to analyze:
${text.slice(0, 2000)}`;

    const content = await callModel([
      { role: "user", content: [{ text: prompt }] },
    ]);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON from AI response");
    const tagData = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ ...tagData, model: "bedrock-ai" }),
    };
  } catch (err) {
    console.error("Tag generation error:", err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

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

const FORMAT_INSTRUCTIONS = {
  oneliner:
    "Summarize the text in exactly ONE sentence (max 150 characters). Be punchy and insightful.",
  paragraph:
    "Summarize the text in one clear, comprehensive paragraph (3-5 sentences). Cover the main points and key insights.",
  bullets:
    'Summarize the text as 5-7 bullet points. Start each bullet with a dash. Make each point concise and actionable. Start with "Key Takeaways:" on the first line.',
};

export const handler = async (event) => {
  try {
    const { text, format = "paragraph" } = JSON.parse(event.body || "{}");
    if (!text || !text.trim()) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: "text is required" }),
      };
    }

    const instruction =
      FORMAT_INSTRUCTIONS[format] || FORMAT_INSTRUCTIONS.paragraph;

    const prompt = `${instruction}

Return ONLY the summary text, no JSON, no markdown formatting, no quotes.

Text to summarize:
${text.slice(0, 4000)}`;

    const summary = await callModel([
      { role: "user", content: [{ text: prompt }] },
    ]);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        summary: summary.trim(),
        format,
        model: "bedrock-ai",
      }),
    };
  } catch (err) {
    console.error("Summarization error:", err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

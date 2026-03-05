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

async function callModel(messages, maxTokens = 2048) {
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

    const today = new Date().toISOString().split("T")[0];

    const prompt = `You are a social media scheduling expert. Based on the following content, create an optimized 7-day posting schedule.

Return ONLY valid JSON with this structure:
{
  "schedule": [
    { "date": "Mar 1", "day": "Mon", "time": "9:00 AM", "platform": "Twitter", "type": "Thread", "status": "ready" }
  ],
  "bestTimes": { "Twitter": "12:30 PM & 6:00 PM", "LinkedIn": "9:00 AM & 3:00 PM", "Instagram": "8:30 PM", "Blog": "10:00 AM" },
  "recommendation": "A one-sentence AI recommendation about posting strategy."
}

Rules:
- Generate 8-10 schedule items spread across 7 days starting from ${today}
- Use platforms: Twitter, LinkedIn, Instagram, Blog
- Use real day names (Mon, Tue, etc.)
- Use types: Post, Thread, Story, Article, Carousel, Reel
- First 2 items should have status "ready", rest "scheduled"

Content to schedule:
${text.slice(0, 1000)}`;

    const content = await callModel([
      { role: "user", content: [{ text: prompt }] },
    ]);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON from AI response");
    const scheduleData = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ ...scheduleData, model: "bedrock-ai" }),
    };
  } catch (err) {
    console.error("Schedule generation error:", err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

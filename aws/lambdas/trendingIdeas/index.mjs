import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Try Claude first, fall back to Nova Lite
const MODELS_TO_TRY = [
  "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
  "us.amazon.nova-lite-v1:0",
];

function buildPrompt(niche, audience, tone) {
  return `You are an expert content strategist who specializes in viral social media and blog content. Your job is to generate 8 fresh, trending content ideas for a creator.

Creator profile:
- Niche: ${niche}
- Target audience: ${audience}
- Preferred tone: ${tone}

Generate 8 unique content ideas that are:
1. Timely — related to current trends, discussions, or seasonal topics in this niche
2. High engagement potential — proven formats like hot takes, listicles, how-tos, personal stories, contrarian takes
3. Actionable — the creator can immediately use these to create content

For EACH idea, provide:
- "title": A compelling, click-worthy headline (max 80 chars)
- "seed": A detailed 2-3 sentence content brief that the creator can use as a starting point to write/generate full content (50-80 words)
- "tags": Array of 2-3 relevant hashtag/topic tags (without #)
- "category": ONE of: "Viral Hooks", "Thread Ideas", "Blog Starters"
- "engagement": Predicted engagement score 75-98 (integer)
- "platforms": Array of 1-3 best platforms from: "twitter", "linkedin", "instagram", "blog"

Output ONLY a valid JSON array of 8 objects. No markdown, no explanation, no code fences. Just the raw JSON array.`;
}

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { niche = "general", audience = "everyone", tone = "casual" } = body;

    const promptText = buildPrompt(niche, audience, tone);
    let rawOutput = "";
    let modelUsed = "";

    for (const modelId of MODELS_TO_TRY) {
      try {
        const command = new ConverseCommand({
          modelId,
          messages: [{ role: "user", content: [{ text: promptText }] }],
          inferenceConfig: {
            maxTokens: 4096,
            temperature: 0.9, // Higher temp for more creative/diverse ideas
            topP: 0.95,
          },
        });

        const response = await bedrock.send(command);
        rawOutput = response.output.message.content[0].text;
        modelUsed = modelId;
        break;
      } catch (modelErr) {
        console.warn(`Model ${modelId} failed: ${modelErr.message}`);
      }
    }

    if (!rawOutput) {
      throw new Error("All models failed. Check Bedrock model access.");
    }

    // Parse the JSON from Claude's output
    let ideas;
    try {
      // Strip potential markdown code fences if present
      const cleaned = rawOutput
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      ideas = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse AI output:", rawOutput.slice(0, 500));
      throw new Error("AI returned invalid JSON. Please retry.");
    }

    // Validate and normalize ideas
    const validated = ideas.slice(0, 8).map((idea, i) => ({
      id: `ai_${Date.now()}_${i}`,
      title: String(idea.title || "Untitled Idea").slice(0, 100),
      seed: String(idea.seed || "").slice(0, 500),
      tags: Array.isArray(idea.tags) ? idea.tags.slice(0, 4) : [],
      category: ["Viral Hooks", "Thread Ideas", "Blog Starters"].includes(
        idea.category,
      )
        ? idea.category
        : "Viral Hooks",
      engagement: Math.min(99, Math.max(50, Number(idea.engagement) || 80)),
      platforms: Array.isArray(idea.platforms)
        ? idea.platforms.slice(0, 4)
        : ["twitter"],
      trending: i < 3, // Top 3 marked as trending
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ideas: validated,
        niche,
        model: modelUsed,
        generatedAt: new Date().toISOString(),
      }),
    };
  } catch (err) {
    console.error("Trending ideas error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// NexusFlow API Client
// Stage A: Mock responses for development
// Stage B: Replace BASE_URL with your API Gateway endpoint

const BASE_URL = import.meta.env.VITE_API_URL || "";
const USE_MOCKS = !import.meta.env.VITE_API_URL;

// ── Mock Responses ──────────────────────────────────

const MOCK_DELAYS = { min: 800, max: 2000 };

function mockDelay() {
  const ms =
    MOCK_DELAYS.min + Math.random() * (MOCK_DELAYS.max - MOCK_DELAYS.min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_CONTENT = {
  twitter: (seed, tone) => {
    const casual = tone > 60;
    if (casual) {
      return `🧵 Thread time!\n\nOkay so I just deep-dived into this and WOW...\n\n1/ ${seed.slice(0, 80)}...\n\n2/ The key insight most people miss? It's not about doing more — it's about doing the RIGHT things consistently.\n\n3/ Here's what actually works:\n→ Focus on one platform\n→ Create frameworks, not just content\n→ Engage > broadcast\n\n4/ The data backs this up. Creators who repurpose 1 piece of content across 3+ formats see 4x more engagement.\n\n5/ TL;DR: Work smarter, not harder. Your content is a goldmine — you just need to mine it properly. 💎\n\nRetweet if this hit different 🔥`;
    }
    return `📊 Key Insights Thread:\n\n1/ ${seed.slice(0, 100)}...\n\n2/ After analyzing the latest trends, three critical factors emerge for content strategy success.\n\n3/ Factor 1: Consistency in messaging across platforms while adapting format to each medium's strengths.\n\n4/ Factor 2: Data-driven content optimization — measuring what resonates and iterating accordingly.\n\n5/ Factor 3: Strategic repurposing — one core idea, multiple platform-native expressions.\n\n6/ The bottom line: Quality × Distribution = Impact.\n\nMore insights in our full analysis. #ContentStrategy #DigitalMarketing`;
  },

  linkedin: (seed, tone) => {
    const casual = tone > 60;
    if (casual) {
      return `I learned something powerful this week that changed how I think about content.\n\n${seed.slice(0, 120)}...\n\nHere's the thing nobody tells you:\n\nMost creators burn out because they treat every platform like it needs a brand-new idea.\n\nBut the best creators? They're remix artists.\n\nThey take ONE great insight and shape it for each audience.\n\n→ Blog post becomes a Twitter thread\n→ Thread becomes a LinkedIn carousel\n→ Carousel becomes a short-form video\n→ Video becomes a podcast clip\n\nThe result? 4x the reach with 25% of the effort.\n\nWhat's your go-to content repurposing strategy? Drop it below 👇\n\n#ContentCreation #Marketing #Productivity`;
    }
    return `Strategic Content Distribution: A Framework for Modern Marketers\n\n${seed.slice(0, 150)}...\n\nIn today's fragmented media landscape, the most successful content strategies share three characteristics:\n\n1. Platform-Native Adaptation\nEach platform has unique consumption patterns. Content must be reformatted — not just reposted — to match user expectations and algorithmic preferences.\n\n2. Data-Informed Iteration\nHigh-performing teams establish feedback loops between content performance metrics and editorial planning, enabling rapid optimization.\n\n3. Scalable Production Workflows\nLeveraging AI-assisted tools for content transformation enables teams to maintain quality while significantly increasing output volume.\n\nThe organizations that master this trifecta consistently outperform their peers in engagement, reach, and conversion metrics.\n\n#ContentStrategy #DigitalTransformation #Marketing`;
  },

  instagram: (seed, tone) => {
    return `✨ Content creation doesn't have to be overwhelming.\n\nHere's the secret: Start with ONE great idea, then let it flow across every platform.\n\n${seed.slice(0, 80)}...\n\nSwipe to learn the 5-step framework that top creators use to 4x their output without burning out 🔥\n\n💡 Save this for later!\n\n.\n.\n.\n#ContentCreator #SocialMediaTips #CreatorEconomy #ContentStrategy #DigitalMarketing #ContentRepurposing #MarketingTips #GrowthHacking`;
  },

  blog: (seed, tone) => {
    return `# The Art of Content Transformation: A Complete Guide\n\n## Introduction\n\n${seed.slice(0, 200)}...\n\nIn the modern digital landscape, creating content from scratch for every platform is not just inefficient — it's unsustainable. The most successful content teams have adopted a "create once, distribute everywhere" philosophy.\n\n## The Content Transformation Framework\n\n### Step 1: Create Your Seed Content\n\nEvery great content strategy starts with a single, well-researched piece. This could be a long-form blog post, a video, or even a detailed newsletter. The key is depth and originality.\n\n### Step 2: Identify Platform Opportunities\n\nNot every piece of content belongs on every platform. Analyze your audience data to determine where your message will have the highest impact.\n\n### Step 3: Transform, Don't Just Resize\n\nThe critical distinction between repurposing and cross-posting: each platform version should feel native. A LinkedIn post has a different rhythm than a Twitter thread.\n\n### Step 4: Optimize with Data\n\nTrack performance metrics across platforms. Which transformations drive the most engagement? Where does your audience prefer to consume this type of content?\n\n### Step 5: Iterate and Scale\n\nUse AI-assisted tools like NexusFlow to automate the transformation process while maintaining brand voice consistency.\n\n## Conclusion\n\nContent transformation isn't about cutting corners — it's about maximizing the value of your best ideas. Start with quality, then let technology help you scale.\n\n---\n\n*Generated with NexusFlow — AI-Powered Content Workflows*`;
  },
};

const MOCK_SCORE = {
  score: 78,
  sentiment: { positive: 65, negative: 10, neutral: 25 },
  suggestions: [
    "Add a stronger call-to-action in the closing line",
    "Include 1-2 relevant statistics to boost credibility",
    "Consider adding an emoji hook in the first line",
    "The tone is well-balanced for the target platform",
    "Try a question-based opening to increase engagement",
  ],
};

// ── API Functions ──────────────────────────────────

export async function generateContent(
  seedText,
  platform,
  tone = 50,
  length = "medium",
) {
  if (USE_MOCKS) {
    await mockDelay();
    const generator = MOCK_CONTENT[platform] || MOCK_CONTENT.twitter;
    return {
      generatedText: generator(seedText, tone),
      model: "claude-3.5-sonnet (mock)",
      platform,
    };
  }

  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seedText, platform, tone, length }),
  });
  if (!res.ok) throw new Error(`Generation failed: ${res.statusText}`);
  return res.json();
}

export async function generateImage(seedText, style = "photorealistic") {
  if (USE_MOCKS) {
    await mockDelay();
    // Return a gradient placeholder
    return {
      imageUrl: `https://placehold.co/800x450/1a1a28/8b5cf6?text=AI+Generated+Image&font=inter`,
      model: "titan-image-gen-v2 (mock)",
      style,
    };
  }

  const res = await fetch(`${BASE_URL}/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seedText, style }),
  });
  if (!res.ok) throw new Error(`Image generation failed: ${res.statusText}`);
  return res.json();
}

export async function scoreContent(text, platform = "twitter") {
  if (USE_MOCKS) {
    await mockDelay();
    // Randomize slightly for realism
    return {
      ...MOCK_SCORE,
      score: MOCK_SCORE.score + Math.floor(Math.random() * 15 - 7),
      model: "claude-3-haiku (mock)",
    };
  }

  const res = await fetch(`${BASE_URL}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, platform }),
  });
  if (!res.ok) throw new Error(`Scoring failed: ${res.statusText}`);
  return res.json();
}

export async function scrapeUrl(url) {
  if (USE_MOCKS) {
    await mockDelay();
    return {
      title: "Scraped Article Title",
      text: `This is the extracted content from the URL: ${url}. In a production environment, this would contain the full text content of the linked article, blog post, or web page. The Lambda function would use a library like cheerio to parse the HTML and extract meaningful text content, stripping out navigation, ads, and other non-content elements.`,
      wordCount: 42,
    };
  }

  const res = await fetch(`${BASE_URL}/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`Scraping failed: ${res.statusText}`);
  return res.json();
}

export async function saveWorkspace(workspaceId, nodes, edges, metadata = {}) {
  if (USE_MOCKS) {
    localStorage.setItem(
      `nexusflow_ws_${workspaceId}`,
      JSON.stringify({
        nodes,
        edges,
        metadata,
        savedAt: new Date().toISOString(),
      }),
    );
    return { success: true };
  }

  const res = await fetch(`${BASE_URL}/workspace/${workspaceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodes, edges, metadata }),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.statusText}`);
  return res.json();
}

export async function loadWorkspace(workspaceId) {
  if (USE_MOCKS) {
    const data = localStorage.getItem(`nexusflow_ws_${workspaceId}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  const res = await fetch(`${BASE_URL}/workspace/${workspaceId}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Load failed: ${res.statusText}`);
  }
  return res.json();
}

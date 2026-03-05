// ── NexusFlow API Client ──
// Supports: AWS Bedrock (via Lambda) or Mock responses
// Features: Response caching, AbortController signal support, request deduplication

const BASE_URL = import.meta.env.VITE_API_URL || "";
const USE_MOCKS = !import.meta.env.VITE_API_URL;

// ── Response Cache (LRU-style, max 50 entries) ──
const cache = new Map();
const CACHE_MAX = 50;

function getCacheKey(path, body) {
  return `${path}:${JSON.stringify(body)}`;
}

function cacheGet(key) {
  if (!cache.has(key)) return null;
  const entry = cache.get(key);
  // Move to end (most recently used)
  cache.delete(key);
  cache.set(key, entry);
  return entry;
}

function cacheSet(key, value) {
  if (cache.size >= CACHE_MAX) {
    // Remove oldest entry
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}

// ── Mock Helpers ──
const MOCK_DELAYS = { min: 600, max: 1400 };

function mockDelay(signal) {
  const ms =
    MOCK_DELAYS.min + Math.random() * (MOCK_DELAYS.max - MOCK_DELAYS.min);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });
}

// ── HTTP Helper ──
async function apiPost(path, body, { signal } = {}) {
  // Check cache first (for non-mutating endpoints)
  const key = getCacheKey(path, body);
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errMsg = data?.error || res.statusText || "Unknown error";
    throw new Error(errMsg);
  }

  // Cache successful responses
  cacheSet(key, data);
  return data;
}

// ── Mock Content ──
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

  instagram: (seed) => {
    return `✨ Content creation doesn't have to be overwhelming.\n\nHere's the secret: Start with ONE great idea, then let it flow across every platform.\n\n${seed.slice(0, 80)}...\n\nSwipe to learn the 5-step framework that top creators use to 4x their output without burning out 🔥\n\n💡 Save this for later!\n\n.\n.\n.\n#ContentCreator #SocialMediaTips #CreatorEconomy #ContentStrategy #DigitalMarketing #ContentRepurposing #MarketingTips #GrowthHacking`;
  },

  blog: (seed) => {
    return `# The Art of Content Transformation: A Complete Guide\n\n## Introduction\n\n${seed.slice(0, 200)}...\n\nIn the modern digital landscape, creating content from scratch for every platform is not just inefficient — it's unsustainable.\n\n## The Content Transformation Framework\n\n### Step 1: Create Your Seed Content\nEvery great content strategy starts with a single, well-researched piece.\n\n### Step 2: Identify Platform Opportunities\nAnalyze your audience data to determine where your message will have the highest impact.\n\n### Step 3: Transform, Don't Just Resize\nEach platform version should feel native.\n\n## Conclusion\nContent transformation isn't about cutting corners — it's about maximizing the value of your best ideas.\n\n---\n*Generated with NexusFlow — AI-Powered Content Workflows*`;
  },

  youtube: (seed, tone) => {
    const casual = tone > 60;
    if (casual) {
      return `[FAST PACED INTRO MUISC]\n\nHOST (To Camera):\n"Okay, stop scrolling! Because what I'm about to show you completely changed how I think about this..."\n\n[B-ROLL: Quick montage related to topic]\n\nHOST:\n"So here's the deal: ${seed.slice(0, 100)}..."\n\n[TEXT ON SCREEN: The Big Secret]\n\nHOST:\n"Most people get this entirely wrong. They think you have to do X, but actually, you just need to do Y. Let me break it down into 3 simple steps..."\n\n[TRANSITION SWOOSH]\n\nHOST:\n"Step 1: The Setup..."\n\n[OUTRO MUSIC STARTS]\n\nHOST:\n"If this blew your mind, hit that subscribe button. Drop a comment below if you've tried this, and I'll see you in the next one! Peace!"`;
    }
    return `[PROFESSIONAL LOWER THIRD Graphic fades in]\n\nNARRATOR (Voiceover):\n"Welcome back to the channel. Today, we're diving deep into a topic that is fundamentally shifting the industry landscape."\n\n[A-ROLL: Host looking directly at camera, professional studio lighting]\n\nHOST:\n"The core concept we're analyzing today is this: ${seed.slice(0, 150)}..."\n\n[GRAPHIC: Bullet points appearing on screen]\n\nHOST:\n"In this video, we'll cover:\n1. The underlying mechanics of the problem.\n2. A data-driven approach to the solution.\n3. Implementation strategies you can apply today."\n\n[B-ROLL: Cinematic shots demonstrating the concept]\n\nHOST:\n"Let's begin with the data. Our research indicates that..."\n\n[SOFT OUTRO MUSIC]\n\nHOST:\n"We've included all the relevant links and case studies in the description below. If you found this analysis valuable, please consider subscribing for more weekly deep dives. Thank you for watching."`;
  },

  facebook: (seed, tone) => {
    const casual = tone > 60;
    if (casual) {
      return `📸 Just had to share this!\n\n${seed.slice(0, 120)}...\n\nWho else can relate to this? 🙋‍♂️\n\nI've been thinking about this a lot lately, and honestly... the more I dig into it, the more fascinating it gets.\n\nHere's what really surprised me:\n\n✅ It's way more accessible than most people think\n✅ The results speak for themselves\n✅ Anyone can start doing this TODAY\n\nDrop a 🔥 if you agree, or tell me your experience in the comments! Would love to hear your thoughts.\n\nShare this with someone who needs to see it! 👇`;
    }
    return `📢 Important insight I wanted to share with you all.\n\n${seed.slice(0, 150)}...\n\nThis is something that deserves more attention in our community. After careful consideration and research, here are the key takeaways:\n\n1️⃣ The landscape is shifting rapidly — those who adapt early will benefit most.\n\n2️⃣ Quality always outperforms quantity. This principle remains true across every domain.\n\n3️⃣ Community and collaboration are the real multipliers.\n\nI'd love to hear your perspective on this. What has your experience been?\n\nPlease share if you found this valuable — it might help someone in your network who needs to hear it.\n\n#Insights #Community #Growth`;
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

// ── Caption Generator (multi-platform, parallel via Bedrock) ──

// Build a richer seed text for photo captions
function buildCaptionSeed(description, platform, tone) {
  const toneLabel =
    tone > 70
      ? "very casual and fun"
      : tone > 40
        ? "balanced and conversational"
        : "professional and polished";

  const platformHints = {
    instagram: `Write an engaging Instagram caption for a photo. Include emojis, a compelling hook, a story or insight about the image, a call-to-action (like "save this" or "double tap"), and 15-25 relevant hashtags at the end.`,
    twitter: `Write a Twitter/X post (max 280 chars) or short thread about this photo. Make it punchy, attention-grabbing, and shareable. Include 2-3 hashtags.`,
    linkedin: `Write a professional LinkedIn post about this photo. Start with a bold statement or insight, add professional context, share a lesson or takeaway, and end with a question to drive engagement. Include 3-5 hashtags.`,
    youtube: `Write a YouTube video description for content featuring this image. Include an engaging opening paragraph, key timestamps placeholder, relevant links section, and a subscribe CTA. Include 5-10 relevant tags.`,
    facebook: `Write a Facebook post about this photo. Make it relatable and community-oriented. Ask a question or invite discussion. Keep it warm and authentic.`,
    blog: `Write a blog post section or micro-article inspired by this photo. Include a catchy title, introduction, 2-3 body paragraphs with insights, and a conclusion. Format in Markdown.`,
  };

  return `You are generating a social media caption for a PHOTO/IMAGE.

The photo is described as: "${description}"

Platform: ${platform}
Tone: ${toneLabel} (${tone}/100)

${platformHints[platform] || platformHints.instagram}

IMPORTANT: Write the caption as if you are looking at the actual photo. Reference what's in the image naturally. Make it feel authentic, not generic. DO NOT include any meta-commentary or explanations — output ONLY the final caption text.`;
}

export async function generateCaptionsFromPhoto(
  description,
  platforms = [
    "instagram",
    "twitter",
    "linkedin",
    "youtube",
    "facebook",
    "blog",
  ],
  tone = 50,
  profile = null,
  { signal } = {},
) {
  // Generate captions for all platforms in parallel using Bedrock API
  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      const captionSeed = buildCaptionSeed(description, platform, tone);

      // Try real Bedrock API first
      if (BASE_URL) {
        try {
          const body = {
            seedText: captionSeed,
            platform,
            tone,
            length: platform === "blog" ? "long" : "medium",
          };
          if (profile) {
            body.profile = {
              niche: profile.niche,
              audience: profile.audience,
              tone: profile.tone,
              platforms: profile.platforms,
            };
          }
          const result = await apiPost("/generate", body, { signal });
          return { platform, ...result };
        } catch (apiErr) {
          console.warn(
            `Bedrock API failed for ${platform}, using local fallback:`,
            apiErr.message,
          );
        }
      }

      // Fallback: use local mock generator
      await mockDelay(signal);
      const generator = MOCK_CONTENT[platform] || MOCK_CONTENT.twitter;
      return {
        platform,
        generatedText: generator(description, tone),
        model: "Local (fallback)",
      };
    }),
  );

  return results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      platform: platforms[i],
      generatedText: "Failed to generate. Please try again.",
      error: true,
    };
  });
}

// ── API Functions ──

export async function generateContent(
  seedText,
  platform,
  tone = 50,
  length = "medium",
  profile = null,
  { signal } = {},
) {
  if (USE_MOCKS) {
    await mockDelay(signal);
    const generator = MOCK_CONTENT[platform] || MOCK_CONTENT.twitter;
    return {
      generatedText: generator(seedText, tone),
      model: "claude-3.5-sonnet (mock)",
      platform,
    };
  }
  const body = { seedText, platform, tone, length };
  if (profile) {
    body.profile = {
      niche: profile.niche,
      audience: profile.audience,
      tone: profile.tone,
      platforms: profile.platforms,
    };
  }
  return apiPost("/generate", body, { signal });
}

export async function generateImage(
  seedText,
  style = "photorealistic",
  { signal } = {},
) {
  // Simulate AI-crafted prompt from seed text
  const generateMockResult = async () => {
    await mockDelay(signal);

    const STYLE_DESCRIPTORS = {
      photorealistic: "photorealistic, cinematic lighting, 8K resolution",
      illustration: "vibrant digital illustration, modern flat design",
      minimal: "clean minimalist composition, negative space",
      abstract: "bold abstract art, geometric forms, vivid gradients",
    };

    // Extract key concepts from seed text for a smart prompt
    const words = seedText.toLowerCase().split(/\s+/);
    const themes = [];
    if (
      words.some((w) =>
        [
          "ai",
          "tech",
          "code",
          "software",
          "digital",
          "computer",
          "data",
          "agent",
        ].includes(w),
      )
    )
      themes.push(
        "futuristic technology workspace with holographic displays and flowing data streams",
      );
    if (
      words.some((w) =>
        [
          "food",
          "cook",
          "recipe",
          "meal",
          "kitchen",
          "ingredient",
          "dinner",
        ].includes(w),
      )
    )
      themes.push(
        "artfully arranged gourmet dish with dramatic lighting and fresh ingredients",
      );
    if (
      words.some((w) =>
        ["fitness", "workout", "gym", "exercise", "health", "muscle"].includes(
          w,
        ),
      )
    )
      themes.push(
        "athletic figure in dynamic motion against dramatic backdrop with energy particles",
      );
    if (
      words.some((w) =>
        [
          "travel",
          "adventure",
          "explore",
          "destination",
          "journey",
          "countries",
        ].includes(w),
      )
    )
      themes.push(
        "breathtaking landscape vista at golden hour with misty mountains",
      );
    if (
      words.some((w) =>
        ["fashion", "style", "clothing", "wear", "wardrobe", "outfit"].includes(
          w,
        ),
      )
    )
      themes.push(
        "editorial fashion composition with elegant styling and dramatic shadows",
      );
    if (
      words.some((w) =>
        ["finance", "money", "invest", "budget", "savings", "credit"].includes(
          w,
        ),
      )
    )
      themes.push(
        "sophisticated financial concept with rising graph metaphor and golden light",
      );
    if (
      words.some((w) =>
        ["college", "study", "student", "campus", "university", "gpa"].includes(
          w,
        ),
      )
    )
      themes.push(
        "vibrant campus life scene with warm ambient lighting and autumn colors",
      );
    if (
      words.some((w) =>
        ["content", "create", "social", "media", "brand", "marketing"].includes(
          w,
        ),
      )
    )
      themes.push(
        "creative workspace with content creation tools, screens, and inspiration boards",
      );

    const scene =
      themes.length > 0
        ? themes[0]
        : "inspiring conceptual scene representing innovation and creativity";

    const craftedPrompt = `${scene}, ${STYLE_DESCRIPTORS[style] || STYLE_DESCRIPTORS.photorealistic}, professional composition, mood lighting, no text or lettering`;

    return {
      imageUrl: `https://placehold.co/800x450/1a1a28/8b5cf6?text=AI+Generated+Image&font=inter`,
      craftedPrompt,
      prompt: craftedPrompt,
      model: "titan-image-gen-v2 (mock)",
      style,
    };
  };

  // Try real API first, fallback to mock
  if (!USE_MOCKS) {
    try {
      return await apiPost("/image", { seedText, style }, { signal });
    } catch {
      return generateMockResult();
    }
  }

  return generateMockResult();
}

export async function scoreContent(
  text,
  platform = "twitter",
  { signal } = {},
) {
  if (USE_MOCKS) {
    await mockDelay(signal);
    return {
      ...MOCK_SCORE,
      score: MOCK_SCORE.score + Math.floor(Math.random() * 15 - 7),
      model: "claude-3-haiku (mock)",
    };
  }
  return apiPost("/score", { text, platform }, { signal });
}

export async function scrapeUrl(url, { signal } = {}) {
  if (USE_MOCKS) {
    await mockDelay(signal);
    return {
      title: "Scraped Article Title",
      text: `This is the extracted content from the URL: ${url}. In a production environment, this would contain the full text content of the linked article, blog post, or web page.`,
      wordCount: 42,
    };
  }
  return apiPost("/scrape", { url }, { signal });
}

export async function generateTags(text, { signal } = {}) {
  if (USE_MOCKS) {
    await mockDelay(signal);
    const topics = [
      "AI",
      "ContentCreation",
      "Marketing",
      "DigitalStrategy",
      "Automation",
      "SocialMedia",
      "Growth",
      "Innovation",
      "Tech",
      "CreatorEconomy",
      "Branding",
      "ContentMarketing",
      "Productivity",
    ];
    const categories = [
      "Technology",
      "Marketing",
      "Business Strategy",
      "Social Media",
      "Content Creation",
    ];
    const seoKeywords = [
      "content creation tips",
      "AI marketing tools",
      "social media strategy",
      "content repurposing",
      "digital content workflow",
      "content automation",
      "engagement optimization",
    ];
    return {
      hashtags: topics
        .sort(() => Math.random() - 0.5)
        .slice(0, 8 + Math.floor(Math.random() * 5))
        .map((t) => `#${t}`),
      categories: categories.sort(() => Math.random() - 0.5).slice(0, 3),
      keywords: seoKeywords.sort(() => Math.random() - 0.5).slice(0, 5),
      readingLevel: ["Beginner", "Intermediate", "Advanced"][
        Math.floor(Math.random() * 3)
      ],
      estimatedReadTime: `${2 + Math.floor(Math.random() * 8)} min read`,
      model: "claude-3-haiku (mock)",
    };
  }
  return apiPost("/tags", { text }, { signal });
}

export async function generateSchedule(text, { signal } = {}) {
  if (USE_MOCKS) {
    await mockDelay(signal);
    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const platforms = ["Twitter", "LinkedIn", "Instagram", "Blog"];
    const times = ["9:00 AM", "12:30 PM", "3:00 PM", "6:00 PM", "8:30 PM"];
    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const postsPerDay = 1 + Math.floor(Math.random() * 2);
      for (let j = 0; j < postsPerDay; j++) {
        schedule.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          day: days[date.getDay()],
          time: times[Math.floor(Math.random() * times.length)],
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          type: ["Post", "Thread", "Story", "Article"][
            Math.floor(Math.random() * 4)
          ],
          status: i === 0 ? "ready" : "scheduled",
        });
      }
    }
    return {
      schedule: schedule.slice(0, 10),
      bestTimes: {
        Twitter: "12:30 PM & 6:00 PM",
        LinkedIn: "9:00 AM & 3:00 PM",
        Instagram: "8:30 PM",
      },
      recommendation:
        "Post consistently at peak engagement times. Vary content types across platforms for maximum reach.",
      model: "claude-3-haiku (mock)",
    };
  }
  return apiPost("/schedule", { text }, { signal });
}

export async function summarizeContent(
  text,
  format = "paragraph",
  { signal } = {},
) {
  if (USE_MOCKS) {
    await mockDelay(signal);
    const core = text.slice(0, 60).replace(/\n/g, " ");
    let summary;
    if (format === "oneliner") {
      summary = `${core}... — a framework for transforming AI-driven content workflows into scalable digital strategies.`;
    } else if (format === "bullets") {
      summary = `Key Takeaways:\n\n• AI-powered workflows transform one idea into multi-platform content\n• Content repurposing saves 75% of creation time\n• Platform-native formatting increases engagement by 3-4x\n• Automated scheduling ensures consistent publishing cadence\n• Data-driven optimization through viral scoring and sentiment analysis`;
    } else {
      summary = `${core}... This approach leverages AI to transform a single piece of seed content into platform-optimized formats across Twitter, LinkedIn, Instagram, and blog channels.`;
    }
    return { summary, format, model: "claude-3-haiku (mock)" };
  }
  return apiPost("/summarize", { text, format }, { signal });
}

export async function generateVariants(text, count = 3, { signal } = {}) {
  if (USE_MOCKS) {
    await mockDelay(signal);
    const seed = text.slice(0, 50).replace(/\n/g, " ");
    return {
      variants: [
        {
          text: `🔥 ${seed}...\n\nHere's the thing nobody talks about — the real power of AI in content isn't automation, it's amplification.\n\nEvery platform needs its own voice. Same idea, different execution.\n\nThis is what separates amateurs from professionals.\n\n🧵 Let me break it down:`,
          approach: "Hook-driven (controversy opener)",
          score: 82,
        },
        {
          text: `📊 The data is clear: repurposing content across ${count}+ platforms increases reach by 340%.\n\n${seed}...\n\nBut here's what the numbers don't show — it's not just about posting everywhere.\n\nIt's about tailoring your message to how each audience consumes content.\n\nHere's the framework I use:`,
          approach: "Data-backed (authority opener)",
          score: 75,
        },
        {
          text: `I spent 6 months posting the same content everywhere.\n\nEngagement? Flat.\nFollowers? Stagnant.\n\nThen I discovered something: ${seed}...\n\nThe shift happened when I stopped copying and started adapting.\n\nHere's exactly what changed:`,
          approach: "Story-led (personal narrative)",
          score: 88,
        },
      ],
      model: "claude-3-haiku (mock)",
    };
  }
  return apiPost("/variants", { text, count }, { signal });
}
// ── Workspace Save/Load ──

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

// ── Trending Ideas (Dynamic, niche-aware) ──

const TRENDING_IDEAS_POOL = {
  tech: [
    {
      title: "Why AI Agents Will Replace 40% of SaaS Tools by 2027",
      seed: "The rise of AI agents is creating a paradigm shift in enterprise software. Companies like Devin, Cursor, and AutoGPT are demonstrating that autonomous agents can handle complex workflows that previously required dedicated SaaS products. From customer support to data analysis, AI agents are collapsing entire software categories into single intelligent systems. Here's why this matters for every tech founder and developer.",
      tags: ["AI", "SaaS", "Future"],
      category: "Viral Hooks",
      engagement: 94,
      platforms: ["twitter", "linkedin"],
    },
    {
      title:
        "I Built a Full-Stack App in 47 Minutes Using AI — Here's What I Learned",
      seed: "Last week I challenged myself to build a complete full-stack application using only AI-assisted coding tools. The result? A production-ready app with authentication, database, and deployment — all in under an hour. But it wasn't just about speed. The real insight was about how AI changes the way we think about software architecture and problem decomposition. Here's my breakdown of what worked, what failed, and what this means for the future of development.",
      tags: ["AI Coding", "Developer", "Productivity"],
      category: "Thread Ideas",
      engagement: 89,
      platforms: ["twitter", "blog"],
    },
    {
      title: "The Hidden Cost of Technical Debt: A $2.4M Case Study",
      seed: "Our startup almost died because of technical debt. What started as 'we'll fix it later' shortcuts in our codebase snowballed into a crisis that cost us $2.4 million in lost revenue, delayed features, and developer burnout. I'm sharing the full breakdown — the decisions that seemed smart at the time, the warning signs we ignored, and the systematic approach we used to dig ourselves out. If you're a CTO or engineering lead, this might save your company.",
      tags: ["Engineering", "Startup", "Leadership"],
      category: "Blog Starters",
      engagement: 87,
      platforms: ["linkedin", "blog"],
    },
    {
      title: "React Server Components Changed Everything — My 6-Month Review",
      seed: "Six months ago I migrated our production app to React Server Components. The promises were huge: better performance, smaller bundles, simplified data fetching. Now I have the data to prove what worked and what didn't. Bundle size dropped 62%, TTFB improved by 340ms, but the developer experience trade-offs were real. Here's my honest, data-backed assessment.",
      tags: ["React", "Web Dev", "Performance"],
      category: "Thread Ideas",
      engagement: 82,
      platforms: ["twitter", "blog"],
    },
    {
      title: "5 API Design Mistakes That Kill Developer Experience",
      seed: "After reviewing 200+ API integrations across my career, I've identified the five most common design mistakes that make developers hate your API. These aren't edge cases — they're patterns I see in APIs from companies worth billions. The fix for each is surprisingly simple, but getting them wrong costs you adoption, increases support tickets, and drives developers to your competitors.",
      tags: ["API", "DevRel", "Best Practices"],
      category: "Viral Hooks",
      engagement: 91,
      platforms: ["twitter", "linkedin"],
    },
    {
      title: "How We Reduced Our AWS Bill by 73% Without Losing Performance",
      seed: "Our cloud bill was eating our runway alive — $47K/month for a startup with 12K users. After a brutal 3-week optimization sprint, we cut it to $12.7K while actually improving p95 latency. No magic, just systematic profiling and smart architectural decisions. Here's exactly what we changed, including the Terraform configs and monitoring dashboards we used.",
      tags: ["Cloud", "AWS", "Cost"],
      category: "Blog Starters",
      engagement: 85,
      platforms: ["linkedin", "blog"],
    },
    {
      title: "The 'Vibe Coding' Debate: Why Both Sides Are Wrong",
      seed: "The tech community is divided over 'vibe coding' — using AI to generate code without fully understanding it. Purists say it's dangerous. Pragmatists say it's the future. Having shipped products using both approaches, I think both sides are missing the real point. The question isn't whether to use AI for coding — it's about understanding where human judgment is irreplaceable and where it's just friction.",
      tags: ["AI", "Hot Take", "Coding"],
      category: "Viral Hooks",
      engagement: 96,
      platforms: ["twitter", "linkedin"],
    },
    {
      title: "Postgres Just Became the Only Database You Need",
      seed: "With the latest extensions — pgvector for embeddings, pg_cron for scheduling, PostgREST for instant APIs, and Supabase making it all accessible — Postgres has evolved from a relational database into an entire backend platform. I'm going to make the case that for 90% of applications, you no longer need Redis, Elasticsearch, or a separate vector database.",
      tags: ["Database", "Postgres", "Architecture"],
      category: "Thread Ideas",
      engagement: 88,
      platforms: ["twitter", "blog"],
    },
    {
      title:
        "Why Your Microservices Architecture Is Actually Making Things Worse",
      seed: "Hot take: most companies using microservices would be better off with a well-structured monolith. I've consulted for 15+ companies that adopted microservices 'because Netflix does it' — and 12 of them have worse reliability, slower deployment cycles, and higher infrastructure costs than before. Here's the pattern I keep seeing, and the decision framework I wish someone had given me earlier.",
      tags: ["Architecture", "Hot Take", "DevOps"],
      category: "Viral Hooks",
      engagement: 93,
      platforms: ["twitter", "linkedin"],
    },
    {
      title: "Building in Public: Month 4 Revenue Report ($8.2K MRR)",
      seed: "Month 4 of building my developer tool in public. Revenue hit $8.2K MRR, up from $5.1K last month. But the growth wasn't from where I expected. My biggest channel shifted from Twitter to SEO, my most requested feature flopped, and a bug accidentally became my best conversion tool. Full transparency report with real numbers inside.",
      tags: ["Indie Hacking", "SaaS", "Revenue"],
      category: "Blog Starters",
      engagement: 86,
      platforms: ["twitter", "linkedin"],
    },
    {
      title:
        "The Prompt Engineering Playbook Big Tech Doesn't Want You to Know",
      seed: "I spent 3 months reverse-engineering how top AI companies structure their system prompts. What I found surprised me: the most effective prompts follow a pattern that's almost the opposite of what popular guides teach. Instead of being specific, the best prompts create 'reasoning corridors' that guide the model without constraining it. Here's the framework with real examples.",
      tags: ["AI", "Prompt Engineering", "Guide"],
      category: "Thread Ideas",
      engagement: 92,
      platforms: ["twitter", "blog"],
    },
    {
      title: "TypeScript 6.0 Features That Will Change How You Write Code",
      seed: "TypeScript 6.0 is around the corner, and three features in particular are going to fundamentally change patterns we've used for years. Pattern matching, pipe operators, and decorator metadata aren't just syntax sugar — they enable entirely new architectural patterns. I've been testing the nightly builds for 2 months. Here's what excites me most and what you should start learning now.",
      tags: ["TypeScript", "Web Dev", "New Features"],
      category: "Blog Starters",
      engagement: 81,
      platforms: ["twitter", "blog"],
    },
  ],
  food: [
    {
      title: "The 5-Ingredient Dinner Formula That Went Viral on TikTok",
      seed: "I've been obsessed with the 5-ingredient dinner trend that's taking over TikTok. The concept is simple but brilliant: create restaurant-quality meals using just 5 everyday ingredients. After testing 30+ recipes, I've cracked the formula. It comes down to three principles: acid balance, fat layering, and the 'umami cheat' that most home cooks don't know about. Here are my top 10 recipes that consistently blow people's minds.",
      tags: ["Recipe", "Viral", "Quick Meals"],
      category: "Viral Hooks",
      engagement: 93,
      platforms: ["instagram", "blog"],
    },
    {
      title:
        "Why Farmers Markets Are the New Status Symbol (And Why That's a Problem)",
      seed: "Farmers markets went from community gathering places to Instagram-worthy luxury experiences. $12 sourdough. $8 heirloom tomatoes. Curated aesthetics. While the food quality is real, the gentrification of local food systems is pricing out the very communities they were meant to serve. As a food creator, I think we need to have an honest conversation about this.",
      tags: ["Food Culture", "Hot Take", "Sustainability"],
      category: "Viral Hooks",
      engagement: 88,
      platforms: ["twitter", "linkedin"],
    },
    {
      title: "I Meal Prepped for 30 Days Straight — Here's What Actually Works",
      seed: "After 30 consecutive days of meal prepping, I can tell you that 90% of meal prep advice on social media is wrong. The Pinterest-perfect containers with 5 compartments? Impractical. Cooking everything on Sunday? A recipe for burnout. Here's the realistic, sustainable system I developed that actually saves time, money, and keeps food tasting fresh all week.",
      tags: ["Meal Prep", "Budget", "Practical"],
      category: "Blog Starters",
      engagement: 85,
      platforms: ["instagram", "blog"],
    },
    {
      title:
        "The Science Behind Why Your Pasta Water Should Be 'Salty as the Sea'",
      seed: "You've heard the advice a thousand times: your pasta water should be 'salty as the sea.' But have you ever tested what that actually means? I did. I cooked 15 batches of pasta at different salt concentrations, measured with a refractometer, and taste-tested each one blind. The results challenged everything I thought I knew about pasta cooking. Spoiler: 'salty as the sea' is actually too salty.",
      tags: ["Food Science", "Pasta", "Myth Busting"],
      category: "Thread Ideas",
      engagement: 91,
      platforms: ["twitter", "blog"],
    },
    {
      title: "How I Grew My Food Blog to 100K Monthly Visitors in 8 Months",
      seed: "Eight months ago, my food blog had 247 monthly visitors. Today it gets over 100K. The growth wasn't from going viral — it was from a systematic SEO and content strategy specifically designed for recipe content. I'm breaking down the exact framework: how I pick recipes, structure posts for Google, photograph for clicks, and the Pinterest strategy that drives 40% of my traffic.",
      tags: ["Growth", "Food Blog", "SEO"],
      category: "Blog Starters",
      engagement: 87,
      platforms: ["linkedin", "blog"],
    },
    {
      title:
        "Air Fryer vs. Oven: I Cooked 20 Dishes in Both — Definitive Results",
      seed: "I'm settling this debate once and for all. Over two weeks, I cooked 20 popular dishes in both an air fryer and a conventional oven, rating each on crispiness, cook time, taste, and energy usage. The air fryer won 13 out of 20 — but the 7 dishes where the oven won might surprise you. Full results, photos, and recommendations inside.",
      tags: ["Air Fryer", "Comparison", "Cooking Tips"],
      category: "Thread Ideas",
      engagement: 90,
      platforms: ["instagram", "twitter"],
    },
    {
      title:
        "The Hidden Ingredients in Restaurant Food That Make It Taste Better",
      seed: "Ever wonder why restaurant food just hits different? It's not just about technique — it's about ingredients most home cooks never use. After working in professional kitchens for 6 years, I'm revealing the 8 'secret weapons' that chefs use daily: MSG (yes, it's safe), finishing butter amounts that would shock you, anchovy paste in everything, and more.",
      tags: ["Chef Secrets", "Restaurant", "Tips"],
      category: "Viral Hooks",
      engagement: 94,
      platforms: ["instagram", "twitter"],
    },
    {
      title: "Budget Eats: Full Week of Meals for Under $25",
      seed: "Inflation has made grocery shopping feel like highway robbery. But eating well on a budget is still possible — you just need strategy. I planned and cooked an entire week of delicious, nutritious meals for one person spending less than $25 total. No ramen hacks or struggle meals. Real food that actually tastes good. Here's the full shopping list, meal plan, and recipes.",
      tags: ["Budget", "Meal Plan", "Practical"],
      category: "Blog Starters",
      engagement: 89,
      platforms: ["instagram", "blog"],
    },
    {
      title: "Controversial: Expensive Olive Oil Is a Scam (Here's Why)",
      seed: "I conducted a blind taste test with 15 olive oils ranging from $4 to $45. I also sent samples to a lab for chemical analysis. The results were shocking: price had almost zero correlation with quality. Some expensive oils were rancid. Some cheap ones were excellent. The olive oil industry has a massive fraud problem, and I have the data to prove it.",
      tags: ["Hot Take", "Ingredients", "Investigation"],
      category: "Viral Hooks",
      engagement: 95,
      platforms: ["twitter", "blog"],
    },
    {
      title: "The Sourdough Starter Mistake Everyone Makes (And How to Fix It)",
      seed: "Your sourdough starter isn't dying because you're a bad baker. It's dying because of one specific mistake that 80% of home bakers make: inconsistent hydration ratios. After maintaining my starter for 3 years and helping 500+ students troubleshoot theirs, I've identified the exact fix. It takes 3 days to implement and your starter will be more vigorous than ever.",
      tags: ["Sourdough", "Baking", "Tips"],
      category: "Thread Ideas",
      engagement: 86,
      platforms: ["instagram", "blog"],
    },
    {
      title: "What Japanese Convenience Store Food Taught Me About Cooking",
      seed: "Japanese konbini food is a masterclass in flavor engineering. After spending a month eating through 7-Eleven, Lawson, and FamilyMart in Tokyo, I came home with a completely new understanding of texture contrast, umami layering, and portion design. These are the 6 principles I now apply to every dish I make.",
      tags: ["Japanese Food", "Travel", "Technique"],
      category: "Blog Starters",
      engagement: 88,
      platforms: ["instagram", "blog"],
    },
  ],
  fitness: [
    {
      title:
        "The 'Minimum Effective Dose' Workout That's Replacing Hour-Long Sessions",
      seed: "Exercise science has evolved dramatically, but most gym routines haven't. The latest research from McMaster University shows that strategic 20-minute sessions can match — and sometimes exceed — the results of traditional hour-long workouts. The key is exercise selection, intensity manipulation, and rest period optimization. I've been testing this protocol for 12 weeks with measured results.",
      tags: ["Workout", "Science", "Efficiency"],
      category: "Viral Hooks",
      engagement: 93,
      platforms: ["instagram", "twitter"],
    },
    {
      title:
        "Why '10,000 Steps' Is a Marketing Lie (And What Actually Matters)",
      seed: "The 10,000 steps goal was invented by a Japanese pedometer company in 1965 as a marketing gimmick. Modern research shows the actual optimal number is closer to 7,000-8,000 steps, and MORE importantly, it's not about steps at all — it's about Zone 2 heart rate time. I'm breaking down what the science actually says about daily movement goals.",
      tags: ["Health", "Myth Busting", "Science"],
      category: "Thread Ideas",
      engagement: 91,
      platforms: ["twitter", "linkedin"],
    },
    {
      title: "I Tracked My Protein for 90 Days — Here's What Nobody Tells You",
      seed: "After 90 days of meticulously tracking protein intake using a food scale and lab-calculated values (not just app estimates), I discovered that most people dramatically overestimate their protein intake. The average person eating 'high protein' is actually hitting about 60% of their target. Here are the biggest tracking mistakes, hidden protein sources, and the meal framework that finally fixed my intake.",
      tags: ["Nutrition", "Protein", "Data"],
      category: "Blog Starters",
      engagement: 87,
      platforms: ["instagram", "blog"],
    },
    {
      title:
        "The 3 Exercises You Should Do Every Day (According to Physical Therapists)",
      seed: "I interviewed 8 physical therapists and asked them one question: 'If you could only prescribe 3 exercises to every person on earth, what would they be?' The consensus was surprisingly consistent — and none of them are what you'd expect from a typical gym routine. These movements address the three most common dysfunction patterns that lead to pain and injury.",
      tags: ["Mobility", "Prevention", "Daily Routine"],
      category: "Viral Hooks",
      engagement: 95,
      platforms: ["instagram", "twitter"],
    },
    {
      title: "Progressive Overload Is Broken — Why You're Not Getting Stronger",
      seed: "You've been told to 'add weight each week' and that's progressive overload. But this linear model only works for beginners. After your first year of training, this approach leads to plateaus, injuries, and frustration. Here's the periodization framework that elite coaches actually use — and how to apply it to your training whether you're intermediate or advanced.",
      tags: ["Strength", "Programming", "Advanced"],
      category: "Thread Ideas",
      engagement: 84,
      platforms: ["twitter", "blog"],
    },
    {
      title:
        "Morning Routine Showdown: 5AM vs 7AM Workout — Blood Test Results",
      seed: "I spent 6 weeks training at 5AM, then 6 weeks at 7AM, with blood panels, cortisol tests, sleep tracking, and performance metrics for both periods. The fitness influencer narrative that 'early morning training is superior' has some truth — but also some dangerous blind spots. Here's what my bloodwork revealed about the cortisol impact.",
      tags: ["Morning Routine", "Science", "Experiment"],
      category: "Blog Starters",
      engagement: 90,
      platforms: ["instagram", "blog"],
    },
    {
      title: "How to Fix 'Desk Posture' in 8 Minutes Per Day",
      seed: "If you work at a desk, you have predictable muscle imbalances: tight hip flexors, weak glutes, rounded shoulders, forward head posture. After 5 years as a corrective exercise specialist, I've distilled my client protocol into an 8-minute daily routine that reverses these patterns. 94% of my clients report significant improvement within 3 weeks. Here's the exact sequence.",
      tags: ["Posture", "Office", "Quick Fix"],
      category: "Viral Hooks",
      engagement: 92,
      platforms: ["instagram", "linkedin"],
    },
    {
      title: "The Supplement Industry Doesn't Want You to See This Data",
      seed: "I spent $3,000 testing 25 popular supplements for actual ingredient content using third-party lab analysis. The results were alarming: 40% contained less active ingredient than claimed, 3 contained undeclared substances, and several 'proprietary blends' were mostly filler. Here's the full report with brand names, test results, and the 5 supplements that are actually worth your money.",
      tags: ["Supplements", "Investigation", "Health"],
      category: "Viral Hooks",
      engagement: 96,
      platforms: ["twitter", "blog"],
    },
    {
      title: "Zone 2 Cardio Changed My Body More Than 5 Years of HIIT",
      seed: "I spent 5 years doing nothing but high-intensity training — CrossFit, HIIT classes, sprint intervals. I was fit but constantly inflamed, poor sleep, high resting heart rate. Switching to Zone 2 cardio as my base training was transformative: resting heart rate dropped 12 BPM, body fat decreased without diet changes, and I feel better at 35 than I did at 28.",
      tags: ["Cardio", "Zone 2", "Transformation"],
      category: "Thread Ideas",
      engagement: 89,
      platforms: ["instagram", "twitter"],
    },
    {
      title: "Complete Home Gym for Under $200 That Covers Everything",
      seed: "You don't need a $5,000 home gym setup. After 10 years of training, I can tell you that 95% of effective exercises can be done with a surprisingly minimal equipment list costing under $200. I'm breaking down the exact items, the exercises they enable, and a full 4-day program that matches commercial gym results.",
      tags: ["Home Gym", "Budget", "Equipment"],
      category: "Blog Starters",
      engagement: 85,
      platforms: ["instagram", "blog"],
    },
  ],
  fashion: [
    {
      title: "The 'Cost Per Wear' Formula That Changed How I Shop",
      seed: "I used to buy cheap trendy pieces that fell apart after 3 washes. Then I discovered the cost-per-wear formula and it completely transformed my relationship with fashion spending. A $200 jacket worn 200 times = $1 per wear. A $30 fast fashion top worn 3 times = $10 per wear. I tracked every clothing purchase for a full year using this method. Here are my results and the pieces that delivered the best value.",
      tags: ["Smart Shopping", "Budget", "Sustainability"],
      category: "Viral Hooks",
      engagement: 91,
      platforms: ["instagram", "twitter"],
    },
    {
      title: "Why Gen Z Is Killing 'Quiet Luxury' (And What's Replacing It)",
      seed: "The quiet luxury trend dominated 2024, but Gen Z is already moving on. While millennials embraced the old-money aesthetic with its muted tones and logo-free designs, younger consumers are gravitating toward what fashion analysts are calling 'loud personality' — mixing high and low, embracing maximalism, and using fashion as identity expression rather than status signaling.",
      tags: ["Trend Analysis", "Gen Z", "Hot Take"],
      category: "Thread Ideas",
      engagement: 88,
      platforms: ["twitter", "instagram"],
    },
    {
      title:
        "Building a Capsule Wardrobe: The 37-Piece System That Actually Works",
      seed: "I've tried every capsule wardrobe method out there — Project 333, the French wardrobe, the 10x10 challenge. Most of them fail for one reason: they don't account for real life. After 2 years of refinement, I've developed a 37-piece system that handles work, weekends, workouts, and special occasions. Every piece connects to at least 5 others. Zero decision fatigue. Here's the complete breakdown.",
      tags: ["Capsule Wardrobe", "Minimalism", "Guide"],
      category: "Blog Starters",
      engagement: 86,
      platforms: ["instagram", "blog"],
    },
    {
      title:
        "I Wore Only Thrift Store Clothes for 3 Months — Here's My Honest Review",
      seed: "For 90 days, I exclusively wore thrifted and secondhand clothing. I set a monthly budget of $50 and documented every outfit. The results surprised even me: I received more compliments than ever, developed a more distinctive personal style, and discovered that the 'thrift store aesthetic' is a real competitive advantage in fashion content creation.",
      tags: ["Thrifting", "Sustainable", "Challenge"],
      category: "Viral Hooks",
      engagement: 93,
      platforms: ["instagram", "twitter"],
    },
    {
      title: "Color Theory for Outfits: The Science Behind 'Looking Good'",
      seed: "Ever wonder why some outfits just work while others feel off? It's not random — it's color theory. I studied color relationships, undertone matching, and contrast ratios as they apply to fashion. Using principles from art and design, I created a simple framework anyone can use to build cohesive outfits. Your skin undertone is the starting point, and everything flows from there.",
      tags: ["Style Tips", "Color Theory", "Education"],
      category: "Thread Ideas",
      engagement: 84,
      platforms: ["instagram", "blog"],
    },
    {
      title: "The Fast Fashion Pipeline: From Design to Landfill in 7 Days",
      seed: "I traced the lifecycle of a $9 Shein dress from conception to disposal. What I found was staggering: AI-generated designs, 72-hour production cycles, synthetic fabrics that will take 200 years to decompose, and factory conditions that are deliberately obscured. This isn't an anti-fast-fashion rant — it's an investigative deep dive into the infrastructure that makes $5 T-shirts possible.",
      tags: ["Sustainability", "Investigation", "Fast Fashion"],
      category: "Blog Starters",
      engagement: 90,
      platforms: ["twitter", "blog"],
    },
    {
      title: "5 Style Rules That Fashion Editors Follow (But Never Talk About)",
      seed: "After interviewing 12 fashion editors from Vogue, GQ, and Harper's Bazaar, I discovered they all follow the same unwritten rules — rules they've never published in their own magazines. The third-piece rule, the hierarchy of fit, the 60-30-10 color ratio, and two more principles that separate 'styled' from 'dressed.' These aren't trends. They're timeless frameworks.",
      tags: ["Style Rules", "Fashion Editor", "Tips"],
      category: "Viral Hooks",
      engagement: 92,
      platforms: ["instagram", "twitter"],
    },
    {
      title: "How to Dress for Your Body Type Without Hiding Anything",
      seed: "The old 'dress for your body type' advice was about hiding and minimizing. The new approach is about understanding proportions and using clothing as an amplifier, not a disguise. I'm breaking down the proportion framework that works for every body type — not to 'fix' anything, but to help you make intentional style choices that make you feel confident.",
      tags: ["Body Positivity", "Styling", "Guide"],
      category: "Blog Starters",
      engagement: 87,
      platforms: ["instagram", "blog"],
    },
    {
      title: "The Real Difference Between $50 and $500 Jeans (Lab Results)",
      seed: "I sent 10 pairs of jeans — ranging from $30 to $500 — to a textile testing lab. They measured thread count, fiber quality, dye fastness, tensile strength, and seam construction. The results were fascinating: the quality ceiling is around $150-200. Beyond that, you're paying for branding. But below $80, quality drops dramatically. Here are the sweet spot brands and what to look for.",
      tags: ["Denim", "Quality", "Investigation"],
      category: "Thread Ideas",
      engagement: 94,
      platforms: ["twitter", "instagram"],
    },
  ],
  college: [
    {
      title:
        "The Study Technique That Got Me from C's to A's (Backed by Science)",
      seed: "In my sophomore year, I went from a 2.3 GPA to a 3.8 using a single study technique change: active recall with spaced repetition. The science behind it is rock solid — it leverages how your brain actually forms long-term memories. I'm sharing the exact system I use, including my Anki deck structure, study schedule, and the common mistakes that make flashcards useless.",
      tags: ["Study Tips", "GPA", "Science"],
      category: "Viral Hooks",
      engagement: 95,
      platforms: ["instagram", "twitter"],
    },
    {
      title: "How I'm Paying for College Without Student Loans",
      seed: "I'm currently a junior at a state university with zero student loan debt. Not because my parents are rich (household income: $52K) but because I've systematically stacked scholarships, grants, work-study, and side hustles. Total free money received: $47,000. Here's every resource I used, every application I submitted, and the scholarship essay template that won me 8 awards.",
      tags: ["Financial Aid", "Scholarships", "Guide"],
      category: "Blog Starters",
      engagement: 92,
      platforms: ["instagram", "blog"],
    },
    {
      title:
        "College Productivity System: How I Balance 18 Credits + Part-Time Job",
      seed: "People ask how I manage 18 credit hours, a part-time job, a social life, and 7 hours of sleep. The answer isn't discipline — it's systems. I use a modified time-blocking method combined with the Eisenhower matrix that took me 3 semesters to perfect. Some weeks it breaks. But 80% of the time, it keeps me sane. Here's the complete framework.",
      tags: ["Productivity", "Time Management", "Balance"],
      category: "Thread Ideas",
      engagement: 88,
      platforms: ["twitter", "instagram"],
    },
    {
      title: "Dorm Room Setup Under $300 That Looks Like a $3000 Apartment",
      seed: "When I moved into my 12x12 dorm room, I was determined to make it feel like an actual living space, not a prison cell. With $280 and strategic Amazon/IKEA shopping, I created a space that my RA said was 'the best room they'd ever seen.' LED lighting, desk organization, bedding strategy, and the wall art hack that makes any room look twice as big.",
      tags: ["Dorm Life", "Design", "Budget"],
      category: "Viral Hooks",
      engagement: 90,
      platforms: ["instagram", "twitter"],
    },
    {
      title:
        "The LinkedIn Strategy That Landed Me 3 Internship Offers as a Sophomore",
      seed: "Most college students treat LinkedIn like a digital resume and wonder why nobody cares. I treated it like a content platform and started posting about what I was learning in class. Within 4 months, I had 3 internship offers from companies I never applied to. Here's the exact posting strategy, connection approach, and the message template that gets responses from hiring managers.",
      tags: ["Internship", "Career", "LinkedIn"],
      category: "Blog Starters",
      engagement: 89,
      platforms: ["linkedin", "twitter"],
    },
    {
      title: "Why Your Major Doesn't Matter as Much as You Think",
      seed: "I surveyed 200 professionals who graduated 5+ years ago and asked: 'How related is your career to your college major?' The answer: 62% said 'not at all' or 'barely.' The skills that actually mattered — communication, problem-solving, relationship-building — aren't taught in any specific department. Here's what the data says about what actually predicts career success.",
      tags: ["Career", "Hot Take", "Data"],
      category: "Thread Ideas",
      engagement: 86,
      platforms: ["twitter", "linkedin"],
    },
    {
      title:
        "The Complete Guide to Actually Using Office Hours (And Why You Should)",
      seed: "Office hours are the most underutilized resource in higher education. Only 8% of students regularly attend, yet those who do average a full letter grade higher. I went from terrified of talking to professors to having mentors who wrote my grad school recommendations. Here's how to make office hours work for you — from what to ask to how to follow up.",
      tags: ["Academic", "Professors", "Tips"],
      category: "Blog Starters",
      engagement: 83,
      platforms: ["instagram", "blog"],
    },
    {
      title: "Meal Prep for Broke College Students (Real Budget, Real Recipes)",
      seed: "Campus dining costs $15/meal. UberEats is $20+. But cooking in a dorm kitchen? I feed myself for $4/meal and eat better than the dining hall. My system: Sunday prep session (90 min), 5 grab-and-go meals, and 3 recipes that work with a microwave and a single pot. No avocado toast lifestyle content — this is survival cooking that actually tastes good.",
      tags: ["Budget", "Cooking", "Dorm Life"],
      category: "Viral Hooks",
      engagement: 91,
      platforms: ["instagram", "twitter"],
    },
  ],
  travel: [
    {
      title: "How I Travel Full-Time for Less Than My Old Apartment Cost",
      seed: "My rent in San Francisco was $2,400/month. My average monthly travel cost across 14 countries? $1,800. Living out of a carry-on isn't just an adventure — it's financially strategic. I'm breaking down the exact budget: accommodation hacks (house-sitting, slow travel discounts), flight strategies (positioning flights, error fares), and the insurance + banking setup that makes it all work.",
      tags: ["Budget Travel", "Digital Nomad", "Finance"],
      category: "Viral Hooks",
      engagement: 94,
      platforms: ["instagram", "blog"],
    },
    {
      title:
        "The Countries Instagram Ruined (And the Hidden Gems Nobody Posts About)",
      seed: "Santorini, Bali, Dubrovnik — these places have been so heavily Instagrammed that the reality no longer matches the expectation. Overcrowded, overpriced, and over-filtered. Meanwhile, equally stunning destinations remain virtually unknown because they haven't been 'influencer-approved.' Here are 8 alternative destinations that deliver the experience those viral spots promised.",
      tags: ["Hidden Gems", "Hot Take", "Guide"],
      category: "Thread Ideas",
      engagement: 92,
      platforms: ["twitter", "instagram"],
    },
    {
      title: "Airline Status Isn't Worth It Anymore — Here's My New Strategy",
      seed: "I was a loyal United 1K member for 4 years, spending $15K+ annually to maintain status. Last year I did the math and realized the perks I actually used were worth about $800. So I switched to a credit card points strategy that gives me better benefits with zero loyalty required. The airline loyalty model is designed to make you overspend, and I have the spreadsheet to prove it.",
      tags: ["Airlines", "Points", "Strategy"],
      category: "Viral Hooks",
      engagement: 87,
      platforms: ["twitter", "blog"],
    },
    {
      title:
        "Solo Travel Safety: What Actually Works (Not the Fear-Based Advice)",
      seed: "Most solo travel safety content is written to scare you into not going. As someone who's traveled solo through 30+ countries (including places people warned me about), here's what actually keeps you safe: situational awareness habits, the 'gray man' theory, digital safety protocols, and the one physical safety tool that's legal everywhere. Skip the fear. Build skills.",
      tags: ["Solo Travel", "Safety", "Guide"],
      category: "Blog Starters",
      engagement: 89,
      platforms: ["instagram", "blog"],
    },
    {
      title:
        "I Ate My Way Through Southeast Asia for $8/Day — Complete Food Guide",
      seed: "In 3 months across Thailand, Vietnam, Cambodia, and Indonesia, I ate at least 3 incredible meals every single day for an average of $8 total. Street food, night markets, local restaurants — the food quality at this price point would cost $40+ in any Western city. Here's my complete guide: what to eat, where to find it, how to eat safely, and the 25 dishes you absolutely cannot miss.",
      tags: ["Food Travel", "Asia", "Budget"],
      category: "Thread Ideas",
      engagement: 93,
      platforms: ["instagram", "blog"],
    },
    {
      title:
        "The Packing List I Use for Every Trip (Carry-On Only, Any Climate)",
      seed: "After 200+ flights and 40+ countries, I've refined my packing list to 32 items that work in Arctic Norway and tropical Bali. The secret isn't minimalism — it's versatile layering and performance fabrics that look good in both a temple and a cocktail bar. Full list with product links, packing method, and the one item everyone forgets that solves 90% of travel problems.",
      tags: ["Packing", "Gear", "Guide"],
      category: "Blog Starters",
      engagement: 86,
      platforms: ["instagram", "blog"],
    },
    {
      title: "Why 'Slow Travel' Is the Biggest Flex in 2025",
      seed: "Rushing through 5 countries in 10 days isn't travel — it's logistics cosplay. The slow travel movement is gaining momentum because people are realizing that spending a month in one place is cheaper, more authentic, and more restorative than speed-running bucket lists. I spent 6 weeks in one Portuguese village and it was the most transformative travel experience of my life.",
      tags: ["Slow Travel", "Lifestyle", "Trend"],
      category: "Viral Hooks",
      engagement: 88,
      platforms: ["twitter", "instagram"],
    },
  ],
  finance: [
    {
      title:
        "The 'Pay Yourself First' Budget That Automated My Savings to $42K",
      seed: "Two years ago I had $800 in savings. Today I have $42K. The strategy was absurdly simple: I automated transfers on payday before I could spend anything. But the execution details matter. I'm sharing my exact account structure, the automation tools I use, the percentage breakdowns, and how I handled the first 3 months when it felt like I was broke.",
      tags: ["Savings", "Budgeting", "Automation"],
      category: "Viral Hooks",
      engagement: 94,
      platforms: ["twitter", "linkedin"],
    },
    {
      title:
        "Index Funds vs. Individual Stocks: 10-Year Performance Data That Settles the Debate",
      seed: "I tracked two identical $10K portfolios for 10 years — one in a total market index fund, one in individually picked stocks following popular strategies. The index fund won by 34%. But more importantly, the individually picked portfolio required 200+ hours of research. When you factor in time value, the gap is even more dramatic. Full performance data inside.",
      tags: ["Investing", "Data", "Index Funds"],
      category: "Thread Ideas",
      engagement: 90,
      platforms: ["twitter", "blog"],
    },
    {
      title: "The Tax Strategies My Accountant Says Most People Miss",
      seed: "I interviewed 5 CPAs and asked them: 'What's the most money you've saved a client that they didn't know they were leaving on the table?' The answers ranged from $2,000 to $15,000 annually. Most of these strategies are completely legal, widely available, and require zero financial sophistication. They're just not well-publicized because nobody profits from telling you about them.",
      tags: ["Taxes", "Money Saving", "Expert Tips"],
      category: "Viral Hooks",
      engagement: 93,
      platforms: ["twitter", "linkedin"],
    },
    {
      title: "I Lived on 50% of My Income for a Year — What Changed",
      seed: "Making $65K as a software developer, I challenged myself to live on half my income for 12 months. The first month was miserable. By month 3, I discovered I didn't miss 80% of what I cut. By month 12, my relationship with money had fundamentally changed. I saved $32.5K, paid off $8K in credit card debt, and learned that lifestyle inflation is the real wealth killer.",
      tags: ["Frugality", "Challenge", "Mindset"],
      category: "Blog Starters",
      engagement: 88,
      platforms: ["twitter", "blog"],
    },
    {
      title: "Credit Score Hack: 580 to 780 in 11 Months (Exact Steps)",
      seed: "My credit score was 580 after some bad decisions in my early 20s. 11 months later, it was 780. No gimmicks, no 'credit repair companies,' no paid deletions. Just a systematic approach using dispute letters, strategic credit line requests, utilization management, and authorized user strategy. Here's every step I took, in order, with the exact letters I sent.",
      tags: ["Credit Score", "Guide", "Money"],
      category: "Viral Hooks",
      engagement: 96,
      platforms: ["instagram", "twitter"],
    },
    {
      title: "Side Hustle Reality Check: What Actually Makes Money in 2025",
      seed: "I tried 8 popular side hustles for one month each and tracked every dollar and hour. Dropshipping: $-200. Freelance writing: $1,400. Social media management: $3,200. The data reveals that most 'passive income' advice is survivorship bias. Here are the 3 side hustles that actually have favorable economics and the 5 that are a waste of your time.",
      tags: ["Side Hustle", "Income", "Reality Check"],
      category: "Thread Ideas",
      engagement: 91,
      platforms: ["twitter", "instagram"],
    },
    {
      title: "Why You Should Max Your 401(k) Before Paying Off Student Loans",
      seed: "This is controversial, but I have the math to back it up. If your student loan interest rate is below 7% and your employer offers a 401(k) match, you're literally leaving free money on the table by prioritizing loan payoff. I built a spreadsheet comparing both strategies over 30 years. The difference? $247,000 in retirement wealth. Here's the complete analysis.",
      tags: ["Retirement", "Student Loans", "Analysis"],
      category: "Blog Starters",
      engagement: 85,
      platforms: ["linkedin", "blog"],
    },
  ],
  other: [
    {
      title: "The Content Creation Framework That Works for Any Niche",
      seed: "After helping 100+ creators across every niche imaginable — from pet grooming to quantum physics — I've found that viral content follows the same structural pattern regardless of topic. It's the Hook-Stake-Proof-Bridge framework. Every piece of content that breaks through the noise nails all four elements. Here's how to apply it to your specific niche with examples from 12 different industries.",
      tags: ["Content Strategy", "Framework", "Universal"],
      category: "Viral Hooks",
      engagement: 90,
      platforms: ["twitter", "linkedin"],
    },
    {
      title: "How to Find Your Niche When Everything Interests You",
      seed: "The advice 'just pick a niche' is useless when you're genuinely curious about 15 different things. I struggled with this for 2 years before discovering the intersection method: combining two unrelated interests into a unique content angle that nobody else occupies. My niche isn't a category — it's a perspective. Here's the framework I used to find it.",
      tags: ["Niche Selection", "Creator", "Strategy"],
      category: "Blog Starters",
      engagement: 87,
      platforms: ["twitter", "blog"],
    },
    {
      title: "The Algorithm Doesn't Hate You — Your Hooks Are Just Weak",
      seed: "Stop blaming the algorithm. I analyzed 500 posts across 10 accounts in the same niche — same posting times, similar follower counts. The top-performing posts had one thing in common: they opened with a pattern interrupt in the first 3 words. Not hashtag strategy. Not posting time. Just better hooks. Here are the 7 hook formulas that consistently outperform.",
      tags: ["Algorithm", "Growth", "Hooks"],
      category: "Viral Hooks",
      engagement: 94,
      platforms: ["twitter", "instagram"],
    },
    {
      title: "I Posted Every Day for 365 Days — Honest Results and Lessons",
      seed: "On January 1st, I committed to posting content every single day for a year. 365 days later, here's the unfiltered truth: I gained 23K followers, burned out twice, had 3 posts go viral, and 280 posts that nobody cared about. The 80/20 of content creation is real — most of your growth comes from 20% of your content. But you can't predict which 20%. Here's what I learned about consistency, quality, and sustainable creation.",
      tags: ["Consistency", "Challenge", "Real Talk"],
      category: "Thread Ideas",
      engagement: 92,
      platforms: ["twitter", "instagram"],
    },
  ],
};

function getShuffled(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function getTrendingIdeas(profile, { signal } = {}) {
  const niche = profile?.niche || "other";

  // Curated pool as fallback when /trending-ideas Lambda is unavailable
  const generateFromPool = async () => {
    await mockDelay(signal);
    const pool = TRENDING_IDEAS_POOL[niche] || TRENDING_IDEAS_POOL.other;
    const ideas = getShuffled(pool, 8).map((idea, i) => ({
      id: `idea_${Date.now()}_${i}`,
      ...idea,
      engagement: idea.engagement + Math.floor(Math.random() * 6) - 3,
      trending: i < 3,
    }));
    return { ideas, niche, generatedAt: new Date().toISOString() };
  };

  // Try real API first if available, fallback to pool
  if (!USE_MOCKS) {
    try {
      return await apiPost(
        "/trending-ideas",
        {
          niche: profile.niche,
          audience: profile.audience,
          tone: profile.tone,
        },
        { signal },
      );
    } catch {
      // Endpoint not deployed yet — use curated pool
      return generateFromPool();
    }
  }

  return generateFromPool();
}

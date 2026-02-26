import https from "https";
import http from "http";

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error("Too many redirects"));

    const client = url.startsWith("https") ? https : http;

    client
      .get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; NexusFlow/1.0)",
          },
          timeout: 10000,
        },
        (res) => {
          // Handle redirects
          if (
            [301, 302, 303, 307, 308].includes(res.statusCode) &&
            res.headers.location
          ) {
            return fetchUrl(res.headers.location, maxRedirects - 1)
              .then(resolve)
              .catch(reject);
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }

          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(data));
          res.on("error", reject);
        },
      )
      .on("error", reject);
  });
}

function extractText(html) {
  // Remove script and style tags
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  text = text.replace(/<header[\s\S]*?<\/header>/gi, "");

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "Untitled";

  // Get meta description
  const metaMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i,
  );
  const metaDesc = metaMatch ? metaMatch[1].trim() : "";

  // Try to find main content area
  const articleMatch = text.match(/<article[\s\S]*?<\/article>/i);
  const mainMatch = text.match(/<main[\s\S]*?<\/main>/i);
  const contentSource = articleMatch?.[0] || mainMatch?.[0] || text;

  // Strip remaining HTML tags
  let cleanText = contentSource.replace(/<[^>]+>/g, " ");

  // Clean up whitespace
  cleanText = cleanText.replace(/&nbsp;/g, " ");
  cleanText = cleanText.replace(/&amp;/g, "&");
  cleanText = cleanText.replace(/&lt;/g, "<");
  cleanText = cleanText.replace(/&gt;/g, ">");
  cleanText = cleanText.replace(/&quot;/g, '"');
  cleanText = cleanText.replace(/&#39;/g, "'");
  cleanText = cleanText.replace(/\s+/g, " ").trim();

  // Limit to ~5000 words to stay within token limits
  const words = cleanText.split(/\s+/);
  if (words.length > 5000) {
    cleanText = words.slice(0, 5000).join(" ") + "...";
  }

  return {
    title,
    metaDesc,
    text: metaDesc ? `${metaDesc}\n\n${cleanText}` : cleanText,
    wordCount: Math.min(words.length, 5000),
  };
}

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { url } = body;

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "url is required" }),
      };
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid URL format" }),
      };
    }

    const html = await fetchUrl(url);
    const { title, text, wordCount } = extractText(html);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ title, text, wordCount }),
    };
  } catch (err) {
    console.error("Scrape error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

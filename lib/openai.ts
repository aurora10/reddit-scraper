import OpenAI from "openai";
import { z } from "zod";

// Initialize OpenAI with Helicone proxy
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://oai.helicone.ai/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

export const PostCategorySchema = z.object({
  isSolutionRequest: z.boolean(),
  isPainOrAnger: z.boolean(),
  isAdviceRequest: z.boolean(),
  isMoneyTalk: z.boolean(),
});

export type PostCategory = z.infer<typeof PostCategorySchema>;

let tokenUsage = 0; // Tracks token usage within the minute
const TOKEN_LIMIT = 200000; // Limit per minute
const RESET_INTERVAL_MS = 60000; // 1 minute in milliseconds

// Reset token usage every minute
setInterval(() => {
  tokenUsage = 0;
}, RESET_INTERVAL_MS);

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzePostCategory(post: { title: string; content?: string }) {
  try {
    // Estimate token usage for the current request
    const tokenEstimate = 1500; // Adjust based on your average token use per request

    // Wait if token limit is reached
    while (tokenUsage + tokenEstimate > TOKEN_LIMIT) {
      console.warn("Token limit reached. Waiting for a reset...");
      await delay(RESET_INTERVAL_MS); // Wait for the token usage to reset
    }

    console.log(`Analyzing post: "${post.title}"`);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a Reddit post analyzer. Categorize the post based on its content into these categories:
            - Solution Requests: Posts seeking solutions to problems
            - Pain & Anger: Posts expressing frustration or anger
            - Advice Requests: Posts seeking advice
            - Money Talk: Posts discussing financial aspects or spending money
            Return true for each category that applies.`,
        },
        {
          role: "user",
          content: `Post Title: ${post.title}\nPost Content: ${post.content || ""}`,
        },
      ],
      functions: [
        {
          name: "analyzePost",
          parameters: {
            type: "object",
            properties: {
              isSolutionRequest: {
                type: "boolean",
                description: "Post is seeking solutions to problems",
              },
              isPainOrAnger: {
                type: "boolean",
                description: "Post expresses frustration or anger",
              },
              isAdviceRequest: {
                type: "boolean",
                description: "Post is seeking advice",
              },
              isMoneyTalk: {
                type: "boolean",
                description: "Post discusses financial aspects or spending money",
              },
            },
            required: ["isSolutionRequest", "isPainOrAnger", "isAdviceRequest", "isMoneyTalk"],
          },
        },
      ],
      function_call: { name: "analyzePost" },
      temperature: 0,
    });

    // Update the token usage
    tokenUsage += tokenEstimate;

    const result = JSON.parse(completion.choices[0].message.function_call!.arguments);
    console.log('Analysis result:', result);
    return PostCategorySchema.parse(result);
  } catch (error) {
    console.error("Error analyzing post:", error);
    throw error;
  }
}

export async function analyzePostsConcurrently(posts: { title: string; content?: string }[]) {
  try {
    console.log('Starting analysis for', posts.length, 'posts');
    const analysisPromises = posts.map((post) => analyzePostCategory(post));
    const results = await Promise.all(analysisPromises);
    console.log(`Completed analysis for ${results.filter(Boolean).length}/${posts.length} posts`);
    return results;
  } catch (error) {
    console.error('Error in analyzePostsConcurrently:', error);
    throw error;
  }
}

// Keep the original analyzePost function for backward compatibility
export async function analyzePost(post: { title: string; content: string }) {
  try {
    const analysis = await analyzePostCategory(post);
    return {
      analysis,
      analyzed_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing post:', error);
    throw error;
  }
}




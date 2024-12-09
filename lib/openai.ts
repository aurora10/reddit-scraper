import OpenAI from "openai";
import { z } from "zod";

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

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function analyzePostCategory(post: { title: string; content?: string }) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
          content: `Post Title: ${post.title}\nPost Content: ${post.content || ''}`,
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

    const result = JSON.parse(
      completion.choices[0].message.function_call!.arguments
    );

    return PostCategorySchema.parse(result);
  } catch (error) {
    console.error("Error analyzing post:", error);
    throw error;
  }
}

export async function analyzePostsConcurrently(posts: { title: string; content?: string }[]) {
  const analysisPromises = posts.map((post) => analyzePostCategory(post));
  return Promise.all(analysisPromises);
}




import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";

export const aiRouter = createRouter({
  chat: publicQuery
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${env.kimiOpenUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.appSecret}`,
          },
          body: JSON.stringify({
            model: "kimi-latest",
            messages: [
              {
                role: "system",
                content:
                  "You are the Nexus Gaming Cafe AI Assistant. You help cafe administrators with: managing gaming stations, tracking inventory, analyzing revenue, suggesting pricing strategies, handling customer inquiries, and providing operational insights. Be concise, professional, and helpful. Use gaming terminology naturally.",
              },
              ...input.messages,
            ],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI API error:", errorText);
          return {
            response:
              "I'm currently experiencing some connectivity issues. Please try again in a moment. In the meantime, you can check the station status or inventory levels directly from the dashboard.",
          };
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const message = data.choices?.[0]?.message?.content || "No response received.";
        return { response: message };
      } catch (error) {
        console.error("AI chat error:", error);
        return {
          response:
            "I'm having trouble connecting right now. Please check your dashboard data directly or try again shortly.",
        };
      }
    }),
});

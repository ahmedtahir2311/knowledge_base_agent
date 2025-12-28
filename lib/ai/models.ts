// Latest OpenAI models
export const DEFAULT_CHAT_MODEL = "openai/gpt-4.1-mini-2025-04-14";

export type ChatModelTier = "nano" | "mini" | "simple" | "reasoning";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  tier: ChatModelTier;
  description: string;
};

export const chatModels: ChatModel[] = [
  // 🟢 NANO — ultra cheap, utility, background tasks
  {
    id: "openai/gpt-4.1-nano-2025-04-14",
    name: "GPT-4.1 Nano",
    provider: "openai",
    tier: "nano",
    description: "Ultra-low cost model for simple tasks, tagging, summaries, and automation",
  },

  // 🔵 MINI — fast + cheap for most apps
  {
    id: "openai/gpt-4.1-mini-2025-04-14",
    name: "GPT-4.1 Mini",
    provider: "openai",
    tier: "mini",
    description: "Fast, cost-effective model for chat, extraction, and light reasoning",
  },

  // 🟣 SIMPLE — default chat experience
  {
    id: "openai/gpt-4.1-2025-04-14",
    name: "GPT-4.1",
    provider: "openai",
    tier: "simple",
    description: "General-purpose high-quality chat and instruction following",
  },

  // 🔴 REASONING — thinking / planning / architecture
  {
    id: "openai/o4-mini-2025-04-16",
    name: "O4 Mini (Reasoning)",
    provider: "openai",
    tier: "reasoning",
    description: "Cost-effective reasoning model for planning, debugging, and complex decisions",
  },
];

// Group models by provider for UI
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

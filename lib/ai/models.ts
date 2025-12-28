// Latest OpenAI models
export const DEFAULT_CHAT_MODEL = "openai/o4-mini-2025-04-16";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // Latest OpenAI Models
  {
    id: "openai/o4-mini-2025-04-16",
    name: "O4 Mini",
    provider: "openai",
    description: "Smallest, fastest, and most cost-effective reasoning model",
  },
  {
    id: "openai/o3-mini",
    name: "O3 Mini",
    provider: "openai",
    description: "High speed, cost-effective reasoning model",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast, affordable, and intelligent for everyday tasks",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Most capable multimodal model - text, vision, and audio",
  },
  {
    id: "openai/o1-mini",
    name: "O1 Mini",
    provider: "openai",
    description: "Fast reasoning model for STEM tasks",
  },
  {
    id: "openai/o1",
    name: "O1",
    provider: "openai",
    description: "Advanced reasoning model for complex problems",
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

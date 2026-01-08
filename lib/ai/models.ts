// Single model configuration for the application
export const CHAT_MODEL = "openai/gpt-4o-mini";
export const TITLE_GENERATION_MODEL = "openai/gpt-4o-mini";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
};

export const chatModel: ChatModel = {
  id: CHAT_MODEL,
  name: "GPT-4o Mini",
  provider: "openai",
};

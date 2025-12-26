import { createOpenAI } from '@ai-sdk/openai';
import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

const THINKING_SUFFIX_REGEX = /-thinking$/;

// Initialize OpenAI provider if API key is available
const openai = process.env.OPENAI_API_KEY
  ? createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Determine whether to use AI Gateway or direct OpenAI
const useGateway = !openai || process.env.USE_AI_GATEWAY === 'true';

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

/**
 * Get language model based on configuration
 * - Uses mock models in test environment
 * - Uses AI Gateway if configured or no OpenAI key
 * - Uses direct OpenAI if API key is available
 */
export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const isReasoningModel =
    modelId.includes("reasoning") || modelId.endsWith("-thinking");

  // Handle reasoning models
  if (isReasoningModel) {
    const baseModelId = modelId.replace(THINKING_SUFFIX_REGEX, "");
    
    if (useGateway) {
      return wrapLanguageModel({
        model: gateway.languageModel(baseModelId),
        middleware: extractReasoningMiddleware({ tagName: "thinking" }),
      });
    } else {
      // For direct OpenAI, strip the provider prefix
      const openaiModelId = baseModelId.replace(/^openai\//, '');
      return wrapLanguageModel({
        model: openai!.languageModel(openaiModelId),
        middleware: extractReasoningMiddleware({ tagName: "thinking" }),
      });
    }
  }

  // Handle regular models
  if (useGateway) {
    return gateway.languageModel(modelId);
  } else {
    // For direct OpenAI, strip the provider prefix if present
    const openaiModelId = modelId.replace(/^openai\//, '');
    return openai!.languageModel(openaiModelId);
  }
}

/**
 * Get model for title generation
 * Uses fast, cheap model for quick title generation
 */
export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  
  if (useGateway) {
    return gateway.languageModel("anthropic/claude-haiku-4.5");
  } else {
    // Use GPT-4o-mini for title generation (fast and cheap)
    return openai!.languageModel("gpt-4o-mini");
  }
}

/**
 * Get model for artifact generation
 * Uses fast, cheap model for artifact content generation
 */
export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  
  if (useGateway) {
    return gateway.languageModel("anthropic/claude-haiku-4.5");
  } else {
    // Use GPT-4o-mini for artifact generation (fast and cheap)
    return openai!.languageModel("gpt-4o-mini");
  }
}

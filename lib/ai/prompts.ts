import type { Geo } from "@vercel/functions";

export const regularPrompt = `You are a friendly assistant! Keep your responses concise and helpful.

When asked to write, create, or help with something, just do it directly. Don't ask clarifying questions unless absolutely necessary - make reasonable assumptions and proceed with the task.`;

export type RequestHints = {
  latitude: Geo["latitude"];
  longitude: Geo["longitude"];
  city: Geo["city"];
  country: Geo["country"];
};

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export const systemPrompt = ({
  requestHints,
  context,
}: {
  requestHints: RequestHints;
  context?: string;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);
  const contextPrompt = context
    ? `\n\nYou have access to the following context from the user's knowledge base. Use it to answer the question if relevant:\n\n${context}`
    : "";

  return `${regularPrompt}\n\n${requestPrompt}${contextPrompt}`;
};

export const titlePrompt = `Generate a very short chat title (2-5 words max) based on the user's message.
Rules:
- Maximum 30 characters
- No quotes, colons, hashtags, or markdown
- Just the topic/intent, not a full sentence
- Be concise: "Weather in NYC" not "User asking about the weather in New York City"`;

import { UnstructuredClient } from "unstructured-client";

const UNSTRUCTURED_IO_API_URL = process.env.UNSTRUCTURED_IO_API_URL;
const UNSTRUCTURED_IO_API_KEY = process.env.UNSTRUCTURED_IO_API_KEY;

export const client = new UnstructuredClient({
  serverURL: UNSTRUCTURED_IO_API_URL,
  security: {
    apiKeyAuth: UNSTRUCTURED_IO_API_KEY,
  },
  retryConfig: {
    strategy: "backoff",
    retryConnectionErrors: true,
    backoff: {
      initialInterval: 2000, // Increased from 1000ms
      maxInterval: 120000, // Increased from 60000ms (2 minutes)
      exponent: 1.8, // Increased from 1.5 for more aggressive backoff
      maxElapsedTime: 600000, // Increased from 300000ms (10 minutes)
    },
  },
  timeoutMs: 300000, // 5 minute timeout for requests
});

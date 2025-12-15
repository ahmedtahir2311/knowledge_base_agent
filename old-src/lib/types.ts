import { Message } from "ai";
import {
  CoreAssistantMessage,
  CoreMessage,
  CoreSystemMessage,
  CoreToolMessage,
  CoreUserMessage,
} from "ai";

export interface Chat extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  path: string;
  messages: any[];
  sharePath?: string;
  isFavourite?: boolean;
  clientId?: string;
  threadId?: string;
}

export interface GraphData {
  config: any;
  title: string;
  type:
    | "bar"
    | "line"
    | "pie"
    | "donut"
    | "area"
    | "radar"
    | "radialBar"
    | "bubble"
    | "heatmap"
    | "treemap"
    | "boxPlot"
    | "candlestick";
}

export interface TableData {
  headers: string[];
  rows: any[][];
  title?: string;
}

export interface ExtendedMessage extends Message {
  graphData?: GraphData;
  tableData?: TableData;
  reasoning?: string;
}

// Custom type for CoreMessage with reasoning
export type CoreMessageWithReasoning = CoreMessage & {
  reasoning?: string;
};

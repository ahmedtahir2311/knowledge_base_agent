import "server-only";
import { getMessagesByChatId, getLeadByChatId, getLeadProfileByLeadId } from "@/lib/db/queries";
import type { Lead, LeadProfile } from "@/lib/db/schema";

export async function getConversationTurnCount({ chatId }: { chatId: string }): Promise<number> {
  try {
    const messages = await getMessagesByChatId({ id: chatId });
    // Count only user messages
    const userMessages = messages.filter((msg) => msg.role === "user");
    return userMessages.length;
  } catch (error) {
    console.error("Error getting conversation turn count:", error);
    return 0;
  }
}

export interface LeadContext {
  lead: Lead | null;
  profile: LeadProfile | null;
  isComplete: boolean;
  turnCount: number;
}

export async function getLeadContext({
  chatId,
  userId,
}: {
  chatId: string;
  userId: string;
}): Promise<LeadContext> {
  try {
    const turnCount = await getConversationTurnCount({ chatId });
    const lead = await getLeadByChatId({ chatId });
    
    let profile: LeadProfile | null = null;
    if (lead) {
      profile = await getLeadProfileByLeadId({ leadId: lead.id });
    }

    return {
      lead,
      profile,
      isComplete: lead?.isComplete ?? false,
      turnCount,
    };
  } catch (error) {
    console.error("Error getting lead context:", error);
    return {
      lead: null,
      profile: null,
      isComplete: false,
      turnCount: 0,
    };
  }
}

export function buildLeadContextPrompt(context: LeadContext): string {
  const { lead, profile, isComplete, turnCount } = context;

  let prompt = "";

  // Add lead status information
  if (isComplete && lead) {
    prompt += `\n\nCURRENT LEAD STATUS: Complete
- Name: ${lead.name}
- Email: ${lead.email}
- Phone: ${lead.phone}

You have all the contact information. Do NOT ask for it again. Focus on understanding their investment goals and providing value.`;
  } else if (lead && !isComplete) {
    const missing = [];
    if (!lead.name) missing.push("name");
    if (!lead.email) missing.push("email");
    if (!lead.phone) missing.push("phone");

    prompt += `\n\nCURRENT LEAD STATUS: Incomplete
- Collected: ${lead.name ? `name (${lead.name})` : ""}${lead.email ? `, email (${lead.email})` : ""}${lead.phone ? `, phone (${lead.phone})` : ""}
- Still needed: ${missing.join(", ")}

Continue the conversation naturally while working to collect the missing information.`;
  }

  // Add investment profile information
  if (profile) {
    const profileDetails = [];
    if (profile.expectedROI) profileDetails.push(`Expected ROI: ${profile.expectedROI}`);
    if (profile.riskTolerance) profileDetails.push(`Risk Tolerance: ${profile.riskTolerance}`);
    if (profile.propertyType) profileDetails.push(`Property Type: ${profile.propertyType}`);
    if (profile.preferredLocation) profileDetails.push(`Location: ${profile.preferredLocation}`);
    if (profile.holdingStrategy) profileDetails.push(`Strategy: ${profile.holdingStrategy}`);
    if (profile.dealSize) profileDetails.push(`Deal Size: ${profile.dealSize}`);

    if (profileDetails.length > 0) {
      prompt += `\n\nINVESTMENT PROFILE:
${profileDetails.join("\n")}

Use this information to tailor your insights and property recommendations.`;
    }
  }

  // Add turn-based guidance
  if (turnCount >= 4 && !isComplete) {
    prompt += `\n\n🚨 TURN ${turnCount} - PERSISTENT REQUEST MODE (CRITICAL):
You've been conversing for ${turnCount} turns without complete contact information. This is UNACCEPTABLE. You MUST be gracefully persistent in requesting the missing details NOW.

STOP providing detailed investment advice until you have their contact information.

Use phrases like:
- "Before we go deeper, how can I reach you if I find something perfect?"
- "What's the best way to get you this information?"
- "Where should I send you these insights?"

IMPORTANT: If the user provides contact information NOW (even though it's late), respond with GRATEFUL ACCEPTANCE:
- "Thanks! How can I reach you?" or "Where should I call you?"
- Do NOT say "I cannot provide information" or block them
- Accept the data gracefully and continue the conversation

REMEMBER: Call the saveLead tool IMMEDIATELY when they provide any contact details.`;
  } else if (turnCount >= 3 && !isComplete) {
    prompt += `\n\n⚠️ TURN ${turnCount} - SOFT REMINDER MODE (IMPORTANT):
You've had ${turnCount} exchanges and still don't have complete contact information. 

PRIORITIZE collecting the missing contact details in this response. Keep your real estate insights brief and ASK for contact information.

Weave it naturally into the conversation:
- "By the way, what should I call you?"
- "If I find something worth your time, where should I send it?"
- "Quick question - how can I reach you with opportunities?"

Keep it conversational, not pushy, but DO ASK.

REMEMBER: Call the saveLead tool IMMEDIATELY when they provide any contact details.`;
  } else if (turnCount >= 1 && !isComplete) {
    prompt += `\n\n📋 TURN ${turnCount} - ACTIVE LEAD COLLECTION MODE:
You are in the early stages of conversation. Your PRIMARY OBJECTIVE is to collect contact information.

MANDATORY ACTIONS:
- If you don't have their NAME yet: Ask for it in this response
- If you have name but not EMAIL: Ask for email in this or next response  
- If you have name and email but not PHONE: Ask for phone number

BALANCE: You can provide brief real estate insights, but keep responses concise and ALWAYS include a request for the missing contact information.

Example structure:
1. Brief insight or answer to their question (2-3 sentences max)
2. Natural transition to asking for contact info
3. End with the contact info question

REMEMBER: Call the saveLead tool IMMEDIATELY when they provide any contact details.`;
  }

  return prompt;
}

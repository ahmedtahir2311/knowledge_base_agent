import { z } from "zod";
import { tool } from "ai";
import {
  createLead,
  updateLead,
  getLeadByChatId,
  createLeadProfile,
  updateLeadProfile,
  getLeadProfileByLeadId,
} from "@/lib/db/queries";

export const saveLeadTool = ({
  chatId,
  userId,
}: {
  chatId: string;
  userId: string;
}) =>
  tool({
    description:
      "Save user's contact information (name, email, phone). Call this whenever the user provides any contact details, whether all at once or separately. This helps build a relationship and enables follow-up communication.",
    inputSchema: z.object({
      name: z
        .string()
        .optional()
        .describe("User's name or what they want to be called"),
      email: z.string().optional().describe("User's email address"),
      phone: z.string().optional().describe("User's phone number"),
    }),
    execute: async ({ name, email, phone }) => {
      try {
        // Check if lead already exists for this chat
        const existingLead = await getLeadByChatId({ chatId });

        if (existingLead) {
          // Update existing lead
          const updatedLead = await updateLead({
            id: existingLead.id,
            name,
            email,
            phone,
          });

          const savedFields = [];
          if (name) savedFields.push("name");
          if (email) savedFields.push("email");
          if (phone) savedFields.push("phone");

          return {
            success: true,
            message: `Updated contact information: ${savedFields.join(", ")}`,
            isComplete: updatedLead.isComplete,
            leadData: {
              name: updatedLead.name,
              email: updatedLead.email,
              phone: updatedLead.phone,
            },
          };
        }

        // Create new lead
        const newLead = await createLead({
          chatId,
          userId,
          name,
          email,
          phone,
        });

        const savedFields = [];
        if (name) savedFields.push("name");
        if (email) savedFields.push("email");
        if (phone) savedFields.push("phone");

        return {
          success: true,
          message: `Saved contact information: ${savedFields.join(", ")}`,
          isComplete: newLead.isComplete,
          leadData: {
            name: newLead.name,
            email: newLead.email,
            phone: newLead.phone,
          },
        };
      } catch (error) {
        console.error("Error saving lead:", error);
        return {
          success: false,
          message: "Failed to save contact information",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  });

export const saveLeadProfileTool = ({ chatId }: { chatId: string }) =>
  tool({
    description:
      "Save user's investment preferences and profile information. Call this when the user shares details about their investment goals, preferences, or strategy. This helps tailor property recommendations to their needs.",
    inputSchema: z.object({
      expectedROI: z
        .string()
        .optional()
        .describe("Expected return on investment (e.g., '15-20%', '10% annually')"),
      riskTolerance: z
        .string()
        .optional()
        .describe("Risk tolerance level (e.g., 'conservative', 'moderate', 'aggressive')"),
      propertyType: z
        .string()
        .optional()
        .describe("Preferred property type (e.g., 'residential', 'commercial', 'mixed-use')"),
      preferredLocation: z
        .string()
        .optional()
        .describe("Preferred location or area for investment"),
      holdingStrategy: z
        .string()
        .optional()
        .describe("Investment holding strategy (e.g., 'flip', 'long-term rental', 'appreciation')"),
      dealSize: z
        .string()
        .optional()
        .describe("Comfortable deal size or budget (e.g., '$200k-$500k', 'under $1M')"),
      additionalPreferences: z
        .string()
        .optional()
        .describe("Any other investment preferences or requirements"),
    }),
    execute: async ({
      expectedROI,
      riskTolerance,
      propertyType,
      preferredLocation,
      holdingStrategy,
      dealSize,
      additionalPreferences,
    }) => {
      try {
        // Get lead for this chat
        const existingLead = await getLeadByChatId({ chatId });

        if (!existingLead) {
          return {
            success: false,
            message: "No lead found for this chat. Please provide contact information first.",
          };
        }

        // Check if profile exists
        const existingProfile = await getLeadProfileByLeadId({
          leadId: existingLead.id,
        });

        const preferences = {
          expectedROI,
          riskTolerance,
          propertyType,
          preferredLocation,
          holdingStrategy,
          dealSize,
          additionalPreferences,
        };

        if (existingProfile) {
          // Update existing profile
          await updateLeadProfile({
            leadId: existingLead.id,
            preferences,
          });
        } else {
          // Create new profile
          await createLeadProfile({
            leadId: existingLead.id,
            preferences,
          });
        }

        const savedFields = [];
        if (expectedROI) savedFields.push("ROI expectations");
        if (riskTolerance) savedFields.push("risk tolerance");
        if (propertyType) savedFields.push("property type");
        if (preferredLocation) savedFields.push("location preference");
        if (holdingStrategy) savedFields.push("holding strategy");
        if (dealSize) savedFields.push("deal size");
        if (additionalPreferences) savedFields.push("additional preferences");

        return {
          success: true,
          message: `Saved investment profile: ${savedFields.join(", ")}`,
          profileData: preferences,
        };
      } catch (error) {
        console.error("Error saving lead profile:", error);
        return {
          success: false,
          message: "Failed to save investment profile",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  });

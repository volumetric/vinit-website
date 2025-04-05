import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define error types
type ErrorType =
  | "OPENAI_API_KEY_MISSING"
  | "insufficient_quota"
  | "invalid_api_key"
  | "invalid_request_error"
  | "rate_limit_exceeded";

// Mapping of preset types to specific context and requirements
const presetContexts: Record<
  string,
  { context: string; requirements: string }
> = {
  "python-debugger": {
    context: "debugging Python code and identifying issues",
    requirements:
      "include steps for error analysis, logging suggestions, and debugging best practices",
  },
  translation: {
    context: "language translation with cultural awareness",
    requirements:
      "consider cultural context, idioms, and maintaining original meaning",
  },
  "meeting-takeaways": {
    context: "summarizing and organizing meeting information",
    requirements:
      "focus on key decisions, action items, and important discussion points",
  },
  "writing-polisher": {
    context: "improving writing quality and clarity",
    requirements:
      "enhance readability, tone, and professional quality while maintaining original message",
  },
  "professional-analyst": {
    context: "business and data analysis",
    requirements:
      "include data interpretation, business impact, and actionable insights",
  },
  "excel-expert": {
    context: "Excel formulas and spreadsheet functionality",
    requirements:
      "provide formula explanation, use cases, and implementation steps",
  },
  "travel-planning": {
    context: "travel itinerary and logistics planning",
    requirements: "consider timing, local customs, and practical arrangements",
  },
  "sql-sorcerer": {
    context: "SQL query writing and optimization",
    requirements:
      "focus on query efficiency, best practices, and clear documentation",
  },
  "git-gud": {
    context: "Git version control operations",
    requirements:
      "explain commands, workflows, and best practices for version control",
  },
};

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY_MISSING");
    }

    const { instructions, selectedPreset } = await request.json();

    if (!instructions) {
      return NextResponse.json(
        { error: "Instructions are required" },
        { status: 400 }
      );
    }

    const presetInfo = presetContexts[selectedPreset] || {
      context: "general purpose task",
      requirements: "provide clear, actionable instructions",
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert prompt engineer specializing in crafting precise, effective prompts for AI interactions. Your expertise is in ${presetInfo.context}. Your task is to transform simple instructions into comprehensive, well-structured prompts that will yield optimal results.

Key Requirements:
1. Focus on ${presetInfo.requirements}
2. Create a clear, step-by-step structure
3. Include specific examples or scenarios when relevant
4. Define expected input format and requirements
5. Specify desired output format and quality criteria

Format your response in this structure:
[OBJECTIVE]
- Clear statement of what needs to be accomplished

[CONTEXT]
- Relevant background information
- Specific use case details

[REQUIREMENTS]
- Input format and prerequisites
- Specific constraints or conditions
- Quality criteria

[EXPECTED OUTPUT]
- Desired format
- Success criteria
- Examples if applicable

[ADDITIONAL NOTES]
- Edge cases to consider
- Best practices
- Common pitfalls to avoid

Transform this instruction into a detailed prompt: ${instructions}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "text" },
    });

    const generatedPrompt = completion.choices[0].message.content;

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error: any) {
    console.error("Error generating prompt:", error);

    // Map error types to user-friendly messages
    const errorMessages: Record<ErrorType, string> = {
      OPENAI_API_KEY_MISSING:
        "OpenAI API key is not configured in the environment.",
      insufficient_quota: "OpenAI API quota exceeded. Please try again later.",
      invalid_api_key: "Invalid OpenAI API key configuration.",
      invalid_request_error: "Invalid request parameters.",
      rate_limit_exceeded:
        "Too many requests. Please try again in a few moments.",
    };

    const statusCodes: Record<ErrorType, number> = {
      OPENAI_API_KEY_MISSING: 500,
      insufficient_quota: 429,
      invalid_api_key: 401,
      invalid_request_error: 400,
      rate_limit_exceeded: 429,
    };

    const errorType = (error.code || error.message) as ErrorType;
    const errorMessage =
      errorMessages[errorType] ||
      "An unexpected error occurred. Please try again later.";
    const statusCode = statusCodes[errorType] || 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

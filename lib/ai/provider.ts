// AI provider abstraction. Nothing in the app calls this yet — it exists so
// that whichever phase adds AI-assisted features (e.g. program descriptions,
// staff summaries) has a single seam to build against, with no API keys
// required to run the demo.
//
// Selected by env var AI_PROVIDER ("mock" | "anthropic"), default "mock".

export interface AIProvider {
  readonly name: string;
  generateText(prompt: string): Promise<string>;
}

export class MockProvider implements AIProvider {
  readonly name = "mock";

  async generateText(prompt: string): Promise<string> {
    return `[Demo mode: AI response placeholder for prompt: "${prompt.slice(0, 80)}"]`;
  }
}

// TODO(real backend): Wire up an actual Anthropic-backed provider.
// - Add `@anthropic-ai/sdk` as a dependency.
// - Read the API key from `process.env.ANTHROPIC_API_KEY` (set via
//   `vercel env add ANTHROPIC_API_KEY`), and throw a clear error at
//   construction time if it's missing.
// - Implement `generateText` using `client.messages.create(...)`.
// - Consider streaming for any user-facing generation.
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";

  async generateText(_prompt: string): Promise<string> {
    throw new Error(
      "AnthropicProvider is a stub. Implement it in lib/ai/provider.ts before setting AI_PROVIDER=anthropic.",
    );
  }
}

export function getAIProvider(): AIProvider {
  const selected = process.env.AI_PROVIDER ?? "mock";
  switch (selected) {
    case "anthropic":
      return new AnthropicProvider();
    case "mock":
    default:
      return new MockProvider();
  }
}

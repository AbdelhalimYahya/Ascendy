import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type AiMode = 'hint' | 'explain' | 'full_solution' | 'code_review';

const SYSTEM_PROMPTS: Record<AiMode, string> = {
  hint: `You are Ascendy's hint coach. Give ONE small incremental hint at a time. Never give the full answer. Ask what the user tried. Be encouraging, bilingual-aware.`,
  explain: `You explain algorithms in plain language. Adjust depth to the user. Use analogies, then formalize. Never just dump code — teach the why.`,
  full_solution: `Only when explicitly requested: give a complete explanation + clean solution with complexity analysis and edge cases.`,
  code_review: `Review submitted code for efficiency, style, edge cases, and readability. Praise what works, suggest concrete improvements with snippets. Never be harsh.`,
};

@Injectable()
export class AiProviderService {
  constructor(private readonly config: ConfigService) {}

  async generate(mode: AiMode, userMessage: string, context?: { problemTitle?: string; code?: string }): Promise<string> {
    const provider = this.config.get('AI_PROVIDER', 'groq');
    const key =
      this.config.get('GROQ_API_KEY', '') ||
      this.config.get('OPENAI_API_KEY', '') ||
      this.config.get('ANTHROPIC_API_KEY', '') ||
      this.config.get('GEMINI_API_KEY', '');

    if (!key) {
      return this.mocked(mode, userMessage, context);
    }

    // Minimal Groq/OpenAI-compatible call — swappable for Anthropic/Gemini later
    try {
      const base =
        provider === 'openai'
          ? 'https://api.openai.com/v1/chat/completions'
          : 'https://api.groq.com/openai/v1/chat/completions';
      const model = provider === 'openai' ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS[mode] },
            {
              role: 'user',
              content: `${context?.problemTitle ? `Problem: ${context.problemTitle}\n` : ''}${context?.code ? `Code:\n${context.code}\n` : ''}${userMessage}`,
            },
          ],
          temperature: 0.6,
          max_tokens: 800,
        }),
      });
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content ?? this.mocked(mode, userMessage, context);
    } catch {
      return this.mocked(mode, userMessage, context);
    }
  }

  private mocked(mode: AiMode, msg: string, ctx?: { problemTitle?: string; code?: string }) {
    const title = ctx?.problemTitle ? ` for "${ctx.problemTitle}"` : '';
    switch (mode) {
      case 'hint':
        return `💡 Hint${title} (mock — add GROQ_API_KEY for live AI): think about what data structure lets you look up complements in O(1). What have you tried so far? Reply and I'll give step 2.`;
      case 'explain':
        return `📖 Explanation${title} (mock): the core idea is trading space for time — remember what you've seen, so each new element only needs one lookup. Tell me your level and I'll adjust depth. You asked: "${msg.slice(0, 120)}"`;
      case 'full_solution':
        return `✅ Full solution (mock — request live AI for real one): outline → 1) restate, 2) hashmap pass, 3) O(n) proof, 4) edge cases (empty, duplicates).`;
      case 'code_review':
        return `🔍 Code review (mock): nice structure! Check 1) early exits, 2) naming, 3) O(n) time / O(n) space, 4) edge cases (empty input, large n). Paste your Accepted code and set GROQ_API_KEY for a deep review.`;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JudgeResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  runtimeMs: number | null;
  memoryKb: number | null;
  status: string;
}

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

@Injectable()
export class JudgeProviderService {
  private readonly logger = new Logger(JudgeProviderService.name);

  constructor(private readonly config: ConfigService) {}

  languageId(language: string): number {
    const id = LANGUAGE_IDS[language.toLowerCase()];
    if (!id) throw new Error(`Unsupported language: ${language}. Use javascript, python, cpp, java.`);
    return id;
  }

  async execute(code: string, language: string, input: string): Promise<JudgeResult> {
    const enabled = this.config.get('JUDGE0_ENABLED', 'false') === 'true';
    const baseUrl = this.config.get('JUDGE0_URL', 'http://localhost:2358');

    if (!enabled) {
      // Dev mock: echo behavior for Two-Sum style — compares are done by caller.
      // Returns input as stdout so verdict logic can be tested without Judge0.
      // For real judging, set JUDGE0_ENABLED=true and point JUDGE0_URL to your instance.
      return {
        stdout: null,
        stderr: 'Judge0 disabled — set JUDGE0_ENABLED=true for real execution',
        compileOutput: null,
        runtimeMs: 5,
        memoryKb: 1024,
        status: 'Mocked',
      };
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const host = this.config.get('JUDGE0_HOST', '');
      const key = this.config.get('JUDGE0_KEY', '');
      if (host) headers['X-RapidAPI-Host'] = host;
      if (key) headers['X-RapidAPI-Key'] = key;

      const createRes = await fetch(
        `${baseUrl}/submissions?base64_encoded=false&wait=true`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            source_code: code,
            language_id: this.languageId(language),
            stdin: input,
          }),
        },
      );
      const data = (await createRes.json()) as {
        stdout?: string | null;
        stderr?: string | null;
        compile_output?: string | null;
        time?: string | null;
        memory?: number | null;
        status?: { description?: string };
      };
      return {
        stdout: data.stdout ?? null,
        stderr: data.stderr ?? null,
        compileOutput: data.compile_output ?? null,
        runtimeMs: data.time ? Math.round(parseFloat(data.time) * 1000) : null,
        memoryKb: data.memory ?? null,
        status: data.status?.description ?? 'Unknown',
      };
    } catch (e) {
      this.logger.error(`Judge0 failed: ${(e as Error).message}`);
      return {
        stdout: null,
        stderr: `Execution service unavailable: ${(e as Error).message}`,
        compileOutput: null,
        runtimeMs: null,
        memoryKb: null,
        status: 'Error',
      };
    }
  }
}

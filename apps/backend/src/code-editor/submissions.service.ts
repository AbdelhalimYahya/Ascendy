import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { JudgeProviderService } from './judge-provider.service';
import { ProgressService } from '../progress/progress.service';

function normalize(s: string | null | undefined) {
  return (s ?? '').trim().replace(/\r\n/g, '\n');
}

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly judge: JudgeProviderService,
    private readonly progress: ProgressService,
  ) {}

  async run(problemId: string, code: string, language: string) {
    const samples = await this.prisma.testCase.findMany({
      where: { problemId, isSample: true },
    });
    const results = [];
    for (const tc of samples) {
      const r = await this.judge.execute(code, language, tc.input);
      const pass =
        r.stdout !== null && normalize(r.stdout) === normalize(tc.expectedOutput);
      results.push({
        testCaseId: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        stdout: r.stdout,
        stderr: r.stderr,
        pass,
        runtimeMs: r.runtimeMs,
        memoryKb: r.memoryKb,
        status: r.status,
      });
    }
    return { mode: 'run', count: samples.length, passed: results.filter((x) => x.pass).length, results };
  }

  async submit(userId: string, problemId: string, code: string, language: string) {
    const all = await this.prisma.testCase.findMany({ where: { problemId } });
    let verdict = 'Accepted';
    let maxRuntime = 0;
    let maxMemory = 0;
    const details = [];

    for (const tc of all) {
      const r = await this.judge.execute(code, language, tc.input);
      maxRuntime = Math.max(maxRuntime, r.runtimeMs ?? 0);
      maxMemory = Math.max(maxMemory, r.memoryKb ?? 0);
      const pass =
        r.stdout !== null && normalize(r.stdout) === normalize(tc.expectedOutput);
      if (r.compileOutput) verdict = 'Compile Error';
      else if (r.stderr && !r.stdout) verdict = r.status.includes('Time') ? 'TLE' : 'Runtime Error';
      else if (!pass) verdict = 'Wrong Answer';
      details.push({ testCaseId: tc.id, isSample: tc.isSample, pass, stdout: r.stdout, stderr: r.stderr });
      if (verdict !== 'Accepted') break;
    }

    // If Judge0 disabled (mocked), keep verdict Pending so UI explains setup
    const mocked = details.length > 0 && details[0].stdout === null;
    const finalVerdict = mocked && all.length > 0 ? 'Pending' : all.length === 0 ? 'Accepted' : verdict;

    const submission = await this.prisma.submission.create({
      data: {
        userId,
        problemId,
        language,
        code,
        mode: 'submit',
        verdict: finalVerdict,
        runtimeMs: maxRuntime || null,
        memoryKb: maxMemory || null,
      },
    });

    if (finalVerdict === 'Accepted') {
      await this.progress.upsert(userId, {
        problemId,
        status: 'Solved',
        language,
      });
    }

    return { submission, details, verdict: finalVerdict };
  }

  history(userId: string, problemId: string) {
    return this.prisma.submission.findMany({
      where: { userId, problemId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        language: true,
        mode: true,
        verdict: true,
        runtimeMs: true,
        memoryKb: true,
        createdAt: true,
      },
    });
  }
}

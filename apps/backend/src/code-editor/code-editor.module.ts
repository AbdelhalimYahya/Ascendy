import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CodeEditorController } from './code-editor.controller';
import { SubmissionsService } from './submissions.service';
import { JudgeProviderService } from './judge-provider.service';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    ProgressModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
  ],
  controllers: [CodeEditorController],
  providers: [SubmissionsService, JudgeProviderService],
  exports: [SubmissionsService],
})
export class CodeEditorModule {}

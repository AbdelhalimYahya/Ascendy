import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProblemsModule } from './problems/problems.module';
import { TagsModule } from './tags/tags.module';
import { ProgressModule } from './progress/progress.module';
import { CodeEditorModule } from './code-editor/code-editor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    AuthModule,
    UsersModule,
    ProblemsModule,
    TagsModule,
    ProgressModule,
    CodeEditorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

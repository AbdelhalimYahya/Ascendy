import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Ascendy smoke (register → login → problems → progress → social → AI)', () => {
  let app: INestApplication;
  const email = `smoke_${Date.now()}@example.com`;
  let access = '';
  let problemId = '';
  let problemSlug = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health', () => request(app.getHttpServer()).get('/api/health').expect(200));

  it('register', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, username: `u${Date.now()}`.slice(0, 12), password: 'password123' })
      .expect(201);
    access = res.body.accessToken;
    expect(access).toBeDefined();
  });

  it('create problem', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/problems')
      .set('Authorization', `Bearer ${access}`)
      .send({
        title: `Smoke ${Date.now()}`,
        difficulty: 'Easy',
        statement: 'Add numbers',
        tags: ['math'],
      })
      .expect(201);
    problemId = res.body.id;
    problemSlug = res.body.slug;
    expect(problemId).toBeDefined();
  });

  it('add sample + run (mocked verdict)', async () => {
    await request(app.getHttpServer())
      .post(`/api/problems/${problemId}/testcases`)
      .set('Authorization', `Bearer ${access}`)
      .send({ input: '1 2', expectedOutput: '3', isSample: true })
      .expect(201);
    const run = await request(app.getHttpServer())
      .post(`/api/problems/${problemId}/run`)
      .set('Authorization', `Bearer ${access}`)
      .send({ code: 'print(3)', language: 'python' })
      .expect(201);
    expect(run.body.mode).toBe('run');
  });

  it('progress upsert + stats', async () => {
    await request(app.getHttpServer())
      .post('/api/progress')
      .set('Authorization', `Bearer ${access}`)
      .send({ problemId, status: 'Solved', timeSpentMin: 12, language: 'python' })
      .expect(201);
    await request(app.getHttpServer())
      .get('/api/progress/stats/me')
      .set('Authorization', `Bearer ${access}`)
      .expect(200);
  });

  it('social post + vote', async () => {
    const post = await request(app.getHttpServer())
      .post(`/api/problems/${problemId}/posts`)
      .set('Authorization', `Bearer ${access}`)
      .send({ title: 'My approach', content: 'Hashmap FTW' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/posts/${post.body.id}/vote`)
      .set('Authorization', `Bearer ${access}`)
      .send({ value: 1 })
      .expect(201);
  });

  it('roadmap follow + AI hint (mocked)', async () => {
    const rm = await request(app.getHttpServer())
      .post('/api/roadmaps')
      .set('Authorization', `Bearer ${access}`)
      .send({ title: 'Smoke path', goalType: 'custom' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/roadmaps/${rm.body.id}/follow`)
      .set('Authorization', `Bearer ${access}`)
      .expect(201);
    const ai = await request(app.getHttpServer())
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${access}`)
      .send({ problemId, message: 'give me a hint', mode: 'hint' })
      .expect(201);
    expect(ai.body.reply).toBeDefined();
    expect(problemSlug).toBeDefined();
  });
});

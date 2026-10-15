import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter.js';

describe('JIM System E2E API Flow', () => {
  let app: INestApplication;
  let jwtToken: string;
  let testUserId: string;
  let testExerciseId: string;
  let testTemplateId: string;
  let testWorkoutId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueSuffix = Date.now();
  const testEmail = `e2e_athlete_${uniqueSuffix}@example.com`;

  describe('1. Authentication & Profile Flow', () => {
    it('POST /api/v1/auth/register - should register a new athlete', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          displayName: 'E2E Athlete',
          height: 180,
          weightUnit: 'KG',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testEmail);
      jwtToken = res.body.accessToken;
      testUserId = res.body.user.id;
    });

    it('POST /api/v1/auth/login - should authenticate and return JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!',
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
    });

    it('GET /api/v1/profile - should fetch user measurement preferences', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(res.body.displayName).toBe('E2E Athlete');
      expect(res.body.weightUnit).toBe('KG');
    });

    it('PATCH /api/v1/profile - should update user preferences', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          weightUnit: 'LB',
        })
        .expect(200);

      expect(res.body.profile.weightUnit).toBe('LB');
    });
  });

  describe('2. Exercise Catalog Flow', () => {
    it('GET /api/v1/exercises - should list catalog exercises', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/exercises')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);
      testExerciseId = res.body.items[0].id;
    });

    it('POST /api/v1/exercises - should create a custom user exercise', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/exercises')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: `Custom Cable Flyes ${uniqueSuffix}`,
          description: 'High to low cable crossover',
          equipmentType: 'CABLE',
          movementCategory: 'ISOLATION',
          primaryMuscleGroups: ['CHEST'],
          exerciseType: 'STRENGTH',
        })
        .expect(201);

      expect(res.body.name).toBe(`Custom Cable Flyes ${uniqueSuffix}`);
      expect(res.body.isCustom).toBe(true);
    });
  });

  describe('3. Workout Templates Flow', () => {
    it('POST /api/v1/workout-templates - should create a workout routine template', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Hypertrophy Routine A',
          workoutType: 'Push',
          description: 'Chest and shoulders focus',
          exercises: [
            {
              exerciseId: testExerciseId,
              orderIndex: 0,
              suggestedSets: 3,
              suggestedReps: 10,
              suggestedLoad: 80,
            },
          ],
        })
        .expect(201);

      expect(res.body.name).toBe('Hypertrophy Routine A');
      expect(res.body.exercises).toHaveLength(1);
      testTemplateId = res.body.id;
    });

    it('GET /api/v1/workout-templates - should list user templates', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((t: any) => t.id === testTemplateId)).toBe(true);
    });
  });

  describe('4. Workout Session & Sets Flow', () => {
    it('POST /api/v1/workouts - should record a workout session and compute volume', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Wednesday Push Blast',
          startedAt: new Date().toISOString(),
          localDate: '2026-10-15',
          workoutType: 'Push',
          durationSeconds: 3600,
          sessionRpe: 8.5,
          templateId: testTemplateId,
          exercises: [
            {
              exerciseId: testExerciseId,
              orderIndex: 0,
              sets: [
                {
                  setNumber: 1,
                  setType: 'WARMUP',
                  completedReps: 12,
                  weight: 40,
                  weightUnit: 'KG',
                  isCompleted: true,
                },
                {
                  setNumber: 2,
                  setType: 'WORKING',
                  completedReps: 8,
                  weight: 80,
                  weightUnit: 'KG',
                  rpe: 8,
                  isCompleted: true,
                },
                {
                  setNumber: 3,
                  setType: 'WORKING',
                  completedReps: 8,
                  weight: 80,
                  weightUnit: 'KG',
                  rpe: 8.5,
                  isCompleted: true,
                },
              ],
            },
          ],
        })
        .expect(201);

      expect(res.body.name).toBe('Wednesday Push Blast');
      expect(res.body.exercises).toHaveLength(1);
      expect(res.body.exercises[0].sets).toHaveLength(3);
      // Working sets volume: 8*80 + 8*80 = 1280 kg
      expect(res.body.summary.totalWorkingSets).toBe(2);
      expect(res.body.summary.totalVolumeKg).toBe(1280);
      testWorkoutId = res.body.id;
    });

    it('GET /api/v1/workouts/:id - should get detailed workout with sets', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/workouts/${testWorkoutId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(res.body.id).toBe(testWorkoutId);
      expect(res.body.summary.totalWorkingSets).toBe(2);
    });

    it('DELETE /api/v1/workouts/:id - should delete workout session and cascade', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/workouts/${testWorkoutId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/api/v1/workouts/${testWorkoutId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});

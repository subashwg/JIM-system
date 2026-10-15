import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { WorkoutsService } from './workouts.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SetType, WeightUnit, WorkoutStatus } from '@prisma/client';

describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let prisma: PrismaService;

  const mockPrisma = {
    exercise: {
      findMany: vi.fn(),
    },
    workoutSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    workoutExercise: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkoutsService>(WorkoutsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if referenced exercise does not exist', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]); // No matching exercise

      await expect(
        service.create('u1', {
          name: 'Chest Day',
          startedAt: new Date().toISOString(),
          localDate: '2026-10-15',
          exercises: [
            {
              exerciseId: 'non-existent-exercise',
              sets: [{ setNumber: 1, completedReps: 8, weight: 100 }],
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create workout session transactionally and compute summary volume', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([{ id: 'e1' }]);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma);
      });

      const mockCreatedSession = {
        id: 's1',
        userId: 'u1',
        name: 'Chest Day',
        startedAt: new Date(),
        localDate: '2026-10-15',
        exercises: [
          {
            id: 'we1',
            exerciseId: 'e1',
            sets: [
              {
                id: 'ws1',
                setNumber: 1,
                setType: SetType.WARMUP,
                completedReps: 10,
                weight: 50,
                weightUnit: WeightUnit.KG,
                isCompleted: true,
              },
              {
                id: 'ws2',
                setNumber: 2,
                setType: SetType.WORKING,
                completedReps: 8,
                weight: 100,
                weightUnit: WeightUnit.KG,
                isCompleted: true,
              },
            ],
          },
        ],
      };

      mockPrisma.workoutSession.create.mockResolvedValue(mockCreatedSession);

      const result = await service.create('u1', {
        name: 'Chest Day',
        startedAt: new Date().toISOString(),
        localDate: '2026-10-15',
        exercises: [
          {
            exerciseId: 'e1',
            sets: [
              { setNumber: 1, setType: SetType.WARMUP, completedReps: 10, weight: 50 },
              { setNumber: 2, setType: SetType.WORKING, completedReps: 8, weight: 100 },
            ],
          },
        ],
      });

      expect(result.id).toBe('s1');
      // Warmup set excluded from working volume: 8 * 100 = 800 kg
      expect(result.summary.totalVolumeKg).toBe(800);
      expect(result.summary.totalWorkingSets).toBe(1);
      expect(result.summary.totalReps).toBe(18);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if session does not exist', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if session belongs to another user', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: 's1',
        userId: 'other-user',
      });
      await expect(service.findOne('s1', 'u1')).rejects.toThrow(ForbiddenException);
    });
  });
});

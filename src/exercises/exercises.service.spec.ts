import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExercisesService } from './exercises.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EquipmentType, ExerciseType, MovementCategory } from '@prisma/client';

describe('ExercisesService', () => {
  let service: ExercisesService;
  let prisma: PrismaService;

  const mockPrisma = {
    exercise: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    workoutExercise: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated list of exercises', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([
        { id: 'e1', name: 'Barbell Bench Press', isCustom: false },
      ]);
      mockPrisma.exercise.count.mockResolvedValue(1);

      const result = await service.findAll('u1', { page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if exercise does not exist', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if exercise belongs to another user', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: 'e2',
        userId: 'other-user',
        isCustom: true,
      });
      await expect(service.findOne('e2', 'u1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should prevent modifying system default exercises', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: 'system-e1',
        userId: null,
        isCustom: false,
      });

      await expect(
        service.update('system-e1', 'u1', { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create a custom exercise for user', async () => {
      mockPrisma.exercise.create.mockResolvedValue({
        id: 'custom-1',
        userId: 'u1',
        name: 'Incline Smith Press',
        primaryMuscleGroups: ['CHEST'],
        isCustom: true,
      });

      const result = await service.create('u1', {
        name: 'Incline Smith Press',
        equipmentType: EquipmentType.MACHINE,
        movementCategory: MovementCategory.PUSH,
        primaryMuscleGroups: ['CHEST'],
        exerciseType: ExerciseType.STRENGTH,
      });

      expect(result.isCustom).toBe(true);
      expect(mockPrisma.exercise.create).toHaveBeenCalled();
    });
  });
});

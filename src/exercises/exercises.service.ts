import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { UpdateExerciseDto } from './dto/update-exercise.dto.js';
import { ExerciseQueryDto } from './dto/exercise-query.dto.js';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: ExerciseQueryDto) {
    const where: Prisma.ExerciseWhereInput = {
      OR: [{ userId: null }, { userId }],
      isArchived: query.isArchived ?? false,
    };

    if (query.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (query.equipmentType) {
      where.equipmentType = query.equipmentType;
    }

    if (query.movementCategory) {
      where.movementCategory = query.movementCategory;
    }

    if (query.exerciseType) {
      where.exerciseType = query.exerciseType;
    }

    if (query.muscleGroup) {
      const mg = query.muscleGroup.toUpperCase();
      where.primaryMuscleGroups = { has: mg };
    }

    const [items, total] = await Promise.all([
      this.prisma.exercise.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: [{ isCustom: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.exercise.count({ where }),
    ]);

    return {
      items,
      total,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      totalPages: Math.ceil(total / (query.limit ?? 20)),
    };
  }

  async findOne(id: string, userId: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    if (exercise.userId && exercise.userId !== userId) {
      throw new ForbiddenException('Access to this exercise is restricted');
    }

    return exercise;
  }

  async create(userId: string, dto: CreateExerciseDto) {
    return this.prisma.exercise.create({
      data: {
        userId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        equipmentType: dto.equipmentType,
        movementCategory: dto.movementCategory,
        primaryMuscleGroups: dto.primaryMuscleGroups.map((m) => m.toUpperCase()),
        secondaryMuscleGroups: dto.secondaryMuscleGroups?.map((m) => m.toUpperCase()) || [],
        exerciseType: dto.exerciseType,
        isCustom: true,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateExerciseDto) {
    const exercise = await this.findOne(id, userId);

    if (!exercise.isCustom || exercise.userId !== userId) {
      throw new ForbiddenException('Cannot modify default system exercises');
    }

    return this.prisma.exercise.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.equipmentType !== undefined ? { equipmentType: dto.equipmentType } : {}),
        ...(dto.movementCategory !== undefined ? { movementCategory: dto.movementCategory } : {}),
        ...(dto.primaryMuscleGroups !== undefined
          ? { primaryMuscleGroups: dto.primaryMuscleGroups.map((m) => m.toUpperCase()) }
          : {}),
        ...(dto.secondaryMuscleGroups !== undefined
          ? { secondaryMuscleGroups: dto.secondaryMuscleGroups.map((m) => m.toUpperCase()) }
          : {}),
        ...(dto.exerciseType !== undefined ? { exerciseType: dto.exerciseType } : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
      },
    });
  }

  async remove(id: string, userId: string) {
    const exercise = await this.findOne(id, userId);

    if (!exercise.isCustom || exercise.userId !== userId) {
      throw new ForbiddenException('Cannot delete default system exercises');
    }

    // Check if exercise is used in existing workouts
    const workoutUsage = await this.prisma.workoutExercise.count({
      where: { exerciseId: id },
    });

    if (workoutUsage > 0) {
      // Archive instead of hard delete to preserve historical integrity
      await this.prisma.exercise.update({
        where: { id },
        data: { isArchived: true },
      });
      return {
        message: 'Exercise has historical workout records; archived rather than hard deleted',
        archived: true,
      };
    }

    await this.prisma.exercise.delete({
      where: { id },
    });

    return {
      message: 'Exercise deleted successfully',
      deleted: true,
    };
  }

  async getHistory(id: string, userId: string) {
    await this.findOne(id, userId);

    const history = await this.prisma.workoutExercise.findMany({
      where: {
        exerciseId: id,
        session: { userId },
      },
      include: {
        session: {
          select: {
            id: true,
            name: true,
            startedAt: true,
            completedAt: true,
            localDate: true,
          },
        },
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
      orderBy: {
        session: { startedAt: 'desc' },
      },
      take: 20,
    });

    return history.map((h) => ({
      session: h.session,
      notes: h.notes,
      sets: h.sets,
    }));
  }
}

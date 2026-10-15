import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWorkoutTemplateDto } from './dto/create-template.dto.js';
import { UpdateWorkoutTemplateDto } from './dto/update-template.dto.js';

@Injectable()
export class WorkoutTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.workoutTemplate.findMany({
      where: {
        userId,
        isArchived: false,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const template = await this.prisma.workoutTemplate.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Workout template with ID ${id} not found`);
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('Access denied to this template');
    }

    return template;
  }

  async create(userId: string, dto: CreateWorkoutTemplateDto) {
    // Validate exercise IDs
    const exerciseIds = dto.exercises.map((e) => e.exerciseId);
    const existingExercises = await this.prisma.exercise.findMany({
      where: {
        id: { in: exerciseIds },
        OR: [{ userId: null }, { userId }],
      },
      select: { id: true },
    });

    if (existingExercises.length !== new Set(exerciseIds).size) {
      throw new BadRequestException('One or more exercise IDs are invalid or inaccessible');
    }

    return this.prisma.workoutTemplate.create({
      data: {
        userId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        workoutType: dto.workoutType?.trim(),
        notes: dto.notes?.trim(),
        exercises: {
          create: dto.exercises.map((e, index) => ({
            exerciseId: e.exerciseId,
            orderIndex: e.orderIndex ?? index,
            suggestedSets: e.suggestedSets,
            suggestedReps: e.suggestedReps,
            suggestedLoad: e.suggestedLoad,
            restDurationSeconds: e.restDurationSeconds,
            notes: e.notes?.trim(),
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateWorkoutTemplateDto) {
    await this.findOne(id, userId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.exercises) {
        const exerciseIds = dto.exercises.map((e) => e.exerciseId);
        const valid = await tx.exercise.findMany({
          where: {
            id: { in: exerciseIds },
            OR: [{ userId: null }, { userId }],
          },
          select: { id: true },
        });

        if (valid.length !== new Set(exerciseIds).size) {
          throw new BadRequestException('One or more exercise IDs are invalid or inaccessible');
        }

        // Replace template exercises
        await tx.templateExercise.deleteMany({
          where: { templateId: id },
        });

        await tx.templateExercise.createMany({
          data: dto.exercises.map((e, index) => ({
            templateId: id,
            exerciseId: e.exerciseId,
            orderIndex: e.orderIndex ?? index,
            suggestedSets: e.suggestedSets,
            suggestedReps: e.suggestedReps,
            suggestedLoad: e.suggestedLoad,
            restDurationSeconds: e.restDurationSeconds,
            notes: e.notes?.trim(),
          })),
        });
      }

      return tx.workoutTemplate.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined ? { description: dto.description?.trim() } : {}),
          ...(dto.workoutType !== undefined ? { workoutType: dto.workoutType?.trim() } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes?.trim() } : {}),
          ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
        },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      });
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    // Soft delete / archive to avoid breaking workout session history
    await this.prisma.workoutTemplate.update({
      where: { id },
      data: { isArchived: true },
    });

    return {
      message: 'Workout template archived successfully',
      archived: true,
    };
  }
}

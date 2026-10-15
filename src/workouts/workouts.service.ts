import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWorkoutSessionDto } from './dto/create-workout.dto.js';
import { UpdateWorkoutSessionDto } from './dto/update-workout.dto.js';
import { WorkoutQueryDto } from './dto/workout-query.dto.js';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkoutSessionDto) {
    // Validate all exercise IDs
    const exerciseIds = dto.exercises.map((e) => e.exerciseId);
    if (exerciseIds.length > 0) {
      const existing = await this.prisma.exercise.findMany({
        where: {
          id: { in: exerciseIds },
          OR: [{ userId: null }, { userId }],
        },
        select: { id: true },
      });

      if (existing.length !== new Set(exerciseIds).size) {
        throw new BadRequestException('One or more referenced exercise IDs are invalid or inaccessible');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.workoutSession.create({
        data: {
          userId,
          templateId: dto.templateId,
          name: dto.name.trim(),
          startedAt: new Date(dto.startedAt),
          completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
          localDate: dto.localDate,
          workoutType: dto.workoutType?.trim(),
          durationSeconds: dto.durationSeconds,
          sessionRpe: dto.sessionRpe,
          notes: dto.notes?.trim(),
          status: dto.status,
          exercises: {
            create: dto.exercises.map((ex, exIndex) => ({
              exerciseId: ex.exerciseId,
              orderIndex: ex.orderIndex ?? exIndex,
              notes: ex.notes?.trim(),
              supersetGroupId: ex.supersetGroupId,
              sets: {
                create: ex.sets.map((s, sIndex) => ({
                  setNumber: s.setNumber ?? sIndex + 1,
                  setType: s.setType,
                  completedReps: s.completedReps,
                  targetReps: s.targetReps,
                  weight: s.weight,
                  weightUnit: s.weightUnit,
                  rir: s.rir,
                  rpe: s.rpe,
                  restDurationSeconds: s.restDurationSeconds,
                  isCompleted: s.isCompleted ?? true,
                  tempo: s.tempo,
                  side: s.side,
                  notes: s.notes?.trim(),
                })),
              },
            })),
          },
        },
        include: {
          exercises: {
            include: {
              exercise: true,
              sets: {
                orderBy: { setNumber: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      return this.enrichSessionSummary(session);
    });
  }

  async findAll(userId: string, query: WorkoutQueryDto) {
    const where: Prisma.WorkoutSessionWhereInput = {
      userId,
    };

    if (query.startDate) {
      where.localDate = { ...(where.localDate as Prisma.StringFilter), gte: query.startDate };
    }

    if (query.endDate) {
      where.localDate = { ...(where.localDate as Prisma.StringFilter), lte: query.endDate };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.workoutType) {
      where.workoutType = { contains: query.workoutType, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.workoutSession.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        include: {
          exercises: {
            include: {
              exercise: true,
              sets: {
                orderBy: { setNumber: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
        orderBy: [{ startedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.workoutSession.count({ where }),
    ]);

    return {
      items: items.map((item) => this.enrichSessionSummary(item)),
      total,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      totalPages: Math.ceil(total / (query.limit ?? 20)),
    };
  }

  async findOne(id: string, userId: string) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Workout session with ID ${id} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied to this workout session');
    }

    return this.enrichSessionSummary(session);
  }

  async update(id: string, userId: string, dto: UpdateWorkoutSessionDto) {
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
          throw new BadRequestException('One or more referenced exercise IDs are invalid or inaccessible');
        }

        // Delete existing exercises and nested sets
        await tx.workoutExercise.deleteMany({
          where: { workoutSessionId: id },
        });

        // Re-create exercises and sets
        for (const [exIndex, ex] of dto.exercises.entries()) {
          await tx.workoutExercise.create({
            data: {
              workoutSessionId: id,
              exerciseId: ex.exerciseId,
              orderIndex: ex.orderIndex ?? exIndex,
              notes: ex.notes?.trim(),
              supersetGroupId: ex.supersetGroupId,
              sets: {
                create: ex.sets.map((s, sIndex) => ({
                  setNumber: s.setNumber ?? sIndex + 1,
                  setType: s.setType,
                  completedReps: s.completedReps,
                  targetReps: s.targetReps,
                  weight: s.weight,
                  weightUnit: s.weightUnit,
                  rir: s.rir,
                  rpe: s.rpe,
                  restDurationSeconds: s.restDurationSeconds,
                  isCompleted: s.isCompleted ?? true,
                  tempo: s.tempo,
                  side: s.side,
                  notes: s.notes?.trim(),
                })),
              },
            },
          });
        }
      }

      const updated = await tx.workoutSession.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.startedAt !== undefined ? { startedAt: new Date(dto.startedAt) } : {}),
          ...(dto.completedAt !== undefined
            ? { completedAt: dto.completedAt ? new Date(dto.completedAt) : null }
            : {}),
          ...(dto.localDate !== undefined ? { localDate: dto.localDate } : {}),
          ...(dto.workoutType !== undefined ? { workoutType: dto.workoutType?.trim() } : {}),
          ...(dto.durationSeconds !== undefined ? { durationSeconds: dto.durationSeconds } : {}),
          ...(dto.sessionRpe !== undefined ? { sessionRpe: dto.sessionRpe } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes?.trim() } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
        },
        include: {
          exercises: {
            include: {
              exercise: true,
              sets: {
                orderBy: { setNumber: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      return this.enrichSessionSummary(updated);
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.workoutSession.delete({
      where: { id },
    });

    return {
      message: 'Workout session deleted successfully',
      deleted: true,
    };
  }

  private enrichSessionSummary(session: any) {
    let totalReps = 0;
    let totalWorkingSets = 0;
    let totalVolumeKg = 0;

    for (const ex of session.exercises || []) {
      for (const s of ex.sets || []) {
        if (s.isCompleted) {
          totalReps += s.completedReps || 0;
          if (s.setType !== 'WARMUP') {
            totalWorkingSets += 1;
            const weight = s.weight || 0;
            // Convert to KG if LB
            const weightInKg = s.weightUnit === 'LB' ? weight * 0.45359237 : weight;
            totalVolumeKg += (s.completedReps || 0) * weightInKg;
          }
        }
      }
    }

    return {
      ...session,
      summary: {
        totalExercises: session.exercises?.length || 0,
        totalWorkingSets,
        totalReps,
        totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
      },
    };
  }
}

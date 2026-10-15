import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const defaultExercises = [
  {
    name: 'Barbell Bench Press',
    description: 'Flat bench barbell press for chest, anterior delts, and triceps.',
    equipmentType: 'BARBELL',
    movementCategory: 'PUSH',
    primaryMuscleGroups: ['CHEST'],
    secondaryMuscleGroups: ['SHOULDERS', 'TRICEPS'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
  {
    name: 'Barbell Back Squat',
    description: 'Full-depth barbell squat for quadriceps, glutes, and core stability.',
    equipmentType: 'BARBELL',
    movementCategory: 'SQUAT',
    primaryMuscleGroups: ['QUADS', 'GLUTES'],
    secondaryMuscleGroups: ['HAMSTRINGS', 'CORE'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
  {
    name: 'Barbell Deadlift',
    description: 'Conventional deadlift off the floor targeting posterior chain.',
    equipmentType: 'BARBELL',
    movementCategory: 'HINGE',
    primaryMuscleGroups: ['HAMSTRINGS', 'GLUTES', 'LOWER_BACK'],
    secondaryMuscleGroups: ['LATS', 'TRAPS', 'FOREARMS'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
  {
    name: 'Overhead Press (OHP)',
    description: 'Standing barbell overhead press for shoulders and upper chest.',
    equipmentType: 'BARBELL',
    movementCategory: 'PUSH',
    primaryMuscleGroups: ['SHOULDERS'],
    secondaryMuscleGroups: ['TRICEPS', 'UPPER_CHEST', 'CORE'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
  {
    name: 'Barbell Bent-Over Row',
    description: 'Bent-over barbell row for lat and upper back thickness.',
    equipmentType: 'BARBELL',
    movementCategory: 'PULL',
    primaryMuscleGroups: ['LATS', 'UPPER_BACK'],
    secondaryMuscleGroups: ['BICEPS', 'REAR_DELTOID'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
  {
    name: 'Pull-Up',
    description: 'Bodyweight overhand pull-up for back width and arm strength.',
    equipmentType: 'BODYWEIGHT',
    movementCategory: 'PULL',
    primaryMuscleGroups: ['LATS'],
    secondaryMuscleGroups: ['BICEPS', 'UPPER_BACK'],
    exerciseType: 'BODYWEIGHT',
    isCustom: false,
  },
  {
    name: 'Parallel Bar Dips',
    description: 'Bodyweight dips targeting triceps and lower chest.',
    equipmentType: 'BODYWEIGHT',
    movementCategory: 'PUSH',
    primaryMuscleGroups: ['CHEST', 'TRICEPS'],
    secondaryMuscleGroups: ['SHOULDERS'],
    exerciseType: 'BODYWEIGHT',
    isCustom: false,
  },
  {
    name: 'Incline Dumbbell Press',
    description: '30-degree incline dumbbell press targeting upper clavicular head.',
    equipmentType: 'DUMBBELL',
    movementCategory: 'PUSH',
    primaryMuscleGroups: ['CHEST'],
    secondaryMuscleGroups: ['SHOULDERS', 'TRICEPS'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
  {
    name: 'Romanian Deadlift (RDL)',
    description: 'Hip hinge movement emphasizing hamstring and glute stretch under load.',
    equipmentType: 'BARBELL',
    movementCategory: 'HINGE',
    primaryMuscleGroups: ['HAMSTRINGS', 'GLUTES'],
    secondaryMuscleGroups: ['LOWER_BACK'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
  {
    name: 'Dumbbell Lateral Raise',
    description: 'Lateral raises for shoulder side-delt width.',
    equipmentType: 'DUMBBELL',
    movementCategory: 'ISOLATION',
    primaryMuscleGroups: ['SHOULDERS'],
    secondaryMuscleGroups: ['TRAPS'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
  {
    name: 'Cable Lat Pulldown',
    description: 'Wide-grip cable pulldown for vertical pulling volume.',
    equipmentType: 'CABLE',
    movementCategory: 'PULL',
    primaryMuscleGroups: ['LATS'],
    secondaryMuscleGroups: ['BICEPS'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
  {
    name: 'Leg Press',
    description: '45-degree machine leg press for quad and leg hypertrophy.',
    equipmentType: 'MACHINE',
    movementCategory: 'SQUAT',
    primaryMuscleGroups: ['QUADS', 'GLUTES'],
    secondaryMuscleGroups: ['HAMSTRINGS'],
    exerciseType: 'STRENGTH',
    isCustom: false,
  },
];

async function main() {
  console.log('[Seed] Seeding exercise catalog...');
  for (const ex of defaultExercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: ex.name, userId: null },
    });
    if (!existing) {
      await prisma.exercise.create({
        data: ex,
      });
    }
  }
  console.log(`[Seed] Seeded ${defaultExercises.length} default exercises.`);

  // Create demo user
  const demoEmail = 'demo@jim.app';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
    include: { profile: true },
  });

  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash,
        profile: {
          create: {
            displayName: 'Alex Rivers',
            height: 182,
            weightUnit: 'KG',
            lengthUnit: 'CM',
            fluidUnit: 'ML',
            timeZone: 'Europe/London',
            weekStartDay: 'MONDAY',
          },
        },
      },
      include: { profile: true },
    });
    console.log(`[Seed] Created demo user: ${demoEmail} / Password123!`);
  }

  // Create sample template
  const bench = await prisma.exercise.findFirst({ where: { name: 'Barbell Bench Press' } });
  const ohp = await prisma.exercise.findFirst({ where: { name: 'Overhead Press (OHP)' } });
  const dips = await prisma.exercise.findFirst({ where: { name: 'Parallel Bar Dips' } });

  const existingTemplate = await prisma.workoutTemplate.findFirst({
    where: { userId: demoUser.id, name: 'Push Hypertrophy' },
  });

  if (!existingTemplate && bench && ohp && dips) {
    const template = await prisma.workoutTemplate.create({
      data: {
        userId: demoUser.id,
        name: 'Push Hypertrophy',
        description: 'Comprehensive chest, shoulders, and triceps routine',
        workoutType: 'Push',
        notes: 'Take 2-3 minutes rest between compound sets',
        exercises: {
          create: [
            {
              exerciseId: bench.id,
              orderIndex: 0,
              suggestedSets: 4,
              suggestedReps: 8,
              suggestedLoad: 90,
              restDurationSeconds: 180,
              notes: 'Warm up thoroughly first',
            },
            {
              exerciseId: ohp.id,
              orderIndex: 1,
              suggestedSets: 3,
              suggestedReps: 10,
              suggestedLoad: 55,
              restDurationSeconds: 120,
            },
            {
              exerciseId: dips.id,
              orderIndex: 2,
              suggestedSets: 3,
              suggestedReps: 12,
              restDurationSeconds: 90,
            },
          ],
        },
      },
    });

    console.log(`[Seed] Created sample template: ${template.name}`);

    // Create a sample completed workout session
    await prisma.workoutSession.create({
      data: {
        userId: demoUser.id,
        templateId: template.id,
        name: 'Monday Push Session',
        startedAt: new Date(Date.now() - 3600000 * 2),
        completedAt: new Date(Date.now() - 3600000),
        localDate: new Date().toISOString().split('T')[0],
        workoutType: 'Push',
        durationSeconds: 3600,
        sessionRpe: 8.5,
        notes: 'Great workout, bench press felt light today.',
        status: 'COMPLETED',
        exercises: {
          create: [
            {
              exerciseId: bench.id,
              orderIndex: 0,
              sets: {
                create: [
                  {
                    setNumber: 1,
                    setType: 'WARMUP',
                    completedReps: 10,
                    weight: 60,
                    weightUnit: 'KG',
                    isCompleted: true,
                  },
                  {
                    setNumber: 2,
                    setType: 'WORKING',
                    completedReps: 8,
                    weight: 90,
                    weightUnit: 'KG',
                    rpe: 8.0,
                    rir: 2,
                    isCompleted: true,
                  },
                  {
                    setNumber: 3,
                    setType: 'WORKING',
                    completedReps: 8,
                    weight: 92.5,
                    weightUnit: 'KG',
                    rpe: 8.5,
                    rir: 1,
                    isCompleted: true,
                  },
                ],
              },
            },
            {
              exerciseId: ohp.id,
              orderIndex: 1,
              sets: {
                create: [
                  {
                    setNumber: 1,
                    setType: 'WORKING',
                    completedReps: 10,
                    weight: 55,
                    weightUnit: 'KG',
                    rpe: 8.0,
                    isCompleted: true,
                  },
                  {
                    setNumber: 2,
                    setType: 'WORKING',
                    completedReps: 9,
                    weight: 55,
                    weightUnit: 'KG',
                    rpe: 9.0,
                    isCompleted: true,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    console.log('[Seed] Created sample workout session with exercises and sets.');
  }

  console.log('[Seed] Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

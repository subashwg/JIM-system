export type Role = 'USER' | 'ADMIN';
export type WeightUnit = 'KG' | 'LB';
export type LengthUnit = 'CM' | 'INCH';
export type FluidUnit = 'ML' | 'OZ';
export type WeekStartDay = 'MONDAY' | 'SUNDAY';

export type EquipmentType =
  | 'BARBELL'
  | 'DUMBBELL'
  | 'MACHINE'
  | 'CABLE'
  | 'BODYWEIGHT'
  | 'BAND'
  | 'KETTLEBELL'
  | 'OTHER';

export type MovementCategory =
  | 'PUSH'
  | 'PULL'
  | 'SQUAT'
  | 'HINGE'
  | 'LUNGE'
  | 'CARRY'
  | 'ISOLATION'
  | 'CARDIO'
  | 'OTHER';

export type ExerciseType =
  | 'STRENGTH'
  | 'BODYWEIGHT'
  | 'ASSISTED'
  | 'CARDIO'
  | 'DURATION';

export type WorkoutStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type SetType = 'WARMUP' | 'WORKING' | 'DROP_SET' | 'FAILURE';

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  height?: number | null;
  dateOfBirth?: string | null;
  weightUnit: WeightUnit;
  lengthUnit: LengthUnit;
  fluidUnit: FluidUnit;
  timeZone: string;
  weekStartDay: WeekStartDay;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  profile?: UserProfile | null;
}

export interface Exercise {
  id: string;
  userId?: string | null;
  name: string;
  description?: string | null;
  equipmentType: EquipmentType;
  movementCategory: MovementCategory;
  primaryMuscleGroups: string[];
  secondaryMuscleGroups: string[];
  exerciseType: ExerciseType;
  isCustom: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  id?: string;
  orderIndex?: number;
  setNumber?: number;
  setType: SetType;
  weight?: number | null;
  reps?: number | null;
  completedReps?: number | null;
  targetReps?: number | null;
  rpe?: number | null;
  isCompleted?: boolean;
  restTimeSeconds?: number | null;
  restDurationSeconds?: number | null;
  notes?: string | null;
}

export interface WorkoutExercise {
  id?: string;
  exerciseId: string;
  orderIndex: number;
  notes?: string | null;
  exercise?: Exercise;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  name: string;
  notes?: string | null;
  startedAt: string;
  completedAt?: string | null;
  endedAt?: string | null;
  localDate?: string;
  workoutType?: string | null;
  durationSeconds?: number | null;
  status: WorkoutStatus;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplateExercise {
  id?: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetReps?: number | null;
  restTimeSeconds?: number | null;
  notes?: string | null;
  exercise?: Exercise;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  exercises: WorkoutTemplateExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

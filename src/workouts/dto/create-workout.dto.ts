import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { SetSide, SetType, WeightUnit, WorkoutStatus } from '@prisma/client';

export class CreateWorkoutSetDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  setNumber: number;

  @ApiPropertyOptional({ enum: SetType, default: SetType.WORKING })
  @IsOptional()
  @IsEnum(SetType)
  setType?: SetType = SetType.WORKING;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(0)
  completedReps: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetReps?: number;

  @ApiPropertyOptional({ example: 100, description: 'Weight or resistance in weightUnit' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ enum: WeightUnit, default: WeightUnit.KG })
  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit = WeightUnit.KG;

  @ApiPropertyOptional({ example: 2, description: 'Reps in Reserve (0-10)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rir?: number;

  @ApiPropertyOptional({ example: 8.5, description: 'Rate of Perceived Exertion (1-10)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;

  @ApiPropertyOptional({ example: 120, description: 'Rest in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  restDurationSeconds?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean = true;

  @ApiPropertyOptional({ example: '3-0-1-0' })
  @IsOptional()
  @IsString()
  tempo?: string;

  @ApiPropertyOptional({ enum: SetSide })
  @IsOptional()
  @IsEnum(SetSide)
  side?: SetSide;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkoutExerciseDto {
  @ApiProperty({ description: 'ID of the exercise catalog item' })
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number = 0;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Group ID for supersets' })
  @IsOptional()
  @IsString()
  supersetGroupId?: string;

  @ApiProperty({ type: [CreateWorkoutSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutSetDto)
  sets: CreateWorkoutSetDto[];
}

export class CreateWorkoutSessionDto {
  @ApiProperty({ example: 'Monday Push Session' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2026-10-15T08:00:00.000Z' })
  @IsDateString()
  startedAt: string;

  @ApiPropertyOptional({ example: '2026-10-15T09:15:00.000Z' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiProperty({ example: '2026-10-15', description: 'Local calendar date YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty()
  localDate: string;

  @ApiPropertyOptional({ example: 'Push' })
  @IsOptional()
  @IsString()
  workoutType?: string;

  @ApiPropertyOptional({ example: 4500, description: 'Duration in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @ApiPropertyOptional({ example: 8.0, description: 'Overall session RPE (1-10)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  sessionRpe?: number;

  @ApiPropertyOptional({ example: 'Felt strong, added 2.5kg to bench press' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Optional template ID referenced' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ enum: WorkoutStatus, default: WorkoutStatus.COMPLETED })
  @IsOptional()
  @IsEnum(WorkoutStatus)
  status?: WorkoutStatus = WorkoutStatus.COMPLETED;

  @ApiProperty({ type: [CreateWorkoutExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutExerciseDto)
  exercises: CreateWorkoutExerciseDto[];
}

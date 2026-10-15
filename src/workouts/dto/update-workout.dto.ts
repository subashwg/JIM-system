import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { WorkoutStatus } from '@prisma/client';
import { CreateWorkoutExerciseDto } from './create-workout.dto.js';

export class UpdateWorkoutSessionDto {
  @ApiPropertyOptional({ example: 'Monday Push Session' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '2026-10-15T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ example: '2026-10-15T09:15:00.000Z' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ example: '2026-10-15' })
  @IsOptional()
  @IsString()
  localDate?: string;

  @ApiPropertyOptional({ example: 'Push' })
  @IsOptional()
  @IsString()
  workoutType?: string;

  @ApiPropertyOptional({ example: 4500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @ApiPropertyOptional({ example: 8.0 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  sessionRpe?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: WorkoutStatus })
  @IsOptional()
  @IsEnum(WorkoutStatus)
  status?: WorkoutStatus;

  @ApiPropertyOptional({ type: [CreateWorkoutExerciseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutExerciseDto)
  exercises?: CreateWorkoutExerciseDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class TemplateExerciseItemDto {
  @ApiProperty({ description: 'ID of the exercise definition' })
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number = 0;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  suggestedSets?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  suggestedReps?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  suggestedLoad?: number;

  @ApiPropertyOptional({ example: 90, description: 'Rest time in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  restDurationSeconds?: number;

  @ApiPropertyOptional({ example: 'Focus on full range of motion' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkoutTemplateDto {
  @ApiProperty({ example: 'Upper Body Hypertrophy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Focus on chest, back, and shoulders' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Upper Body' })
  @IsOptional()
  @IsString()
  workoutType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [TemplateExerciseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateExerciseItemDto)
  exercises: TemplateExerciseItemDto[];
}

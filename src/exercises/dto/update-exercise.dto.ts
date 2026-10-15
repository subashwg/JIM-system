import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { EquipmentType, ExerciseType, MovementCategory } from '@prisma/client';

export class UpdateExerciseDto {
  @ApiPropertyOptional({ example: 'Barbell Incline Bench Press' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: EquipmentType })
  @IsOptional()
  @IsEnum(EquipmentType)
  equipmentType?: EquipmentType;

  @ApiPropertyOptional({ enum: MovementCategory })
  @IsOptional()
  @IsEnum(MovementCategory)
  movementCategory?: MovementCategory;

  @ApiPropertyOptional({ example: ['CHEST', 'TRICEPS'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primaryMuscleGroups?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryMuscleGroups?: string[];

  @ApiPropertyOptional({ enum: ExerciseType })
  @IsOptional()
  @IsEnum(ExerciseType)
  exerciseType?: ExerciseType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

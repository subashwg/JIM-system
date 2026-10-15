import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EquipmentType, ExerciseType, MovementCategory } from '@prisma/client';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Barbell Incline Bench Press' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Upper chest bench press on a 30-45 degree inclined bench' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: EquipmentType, default: EquipmentType.BARBELL })
  @IsOptional()
  @IsEnum(EquipmentType)
  equipmentType?: EquipmentType;

  @ApiPropertyOptional({ enum: MovementCategory, default: MovementCategory.PUSH })
  @IsOptional()
  @IsEnum(MovementCategory)
  movementCategory?: MovementCategory;

  @ApiProperty({ example: ['CHEST', 'ANTERIOR_DELTOID', 'TRICEPS'] })
  @IsArray()
  @IsString({ each: true })
  primaryMuscleGroups: string[];

  @ApiPropertyOptional({ example: ['CORE'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryMuscleGroups?: string[];

  @ApiPropertyOptional({ enum: ExerciseType, default: ExerciseType.STRENGTH })
  @IsOptional()
  @IsEnum(ExerciseType)
  exerciseType?: ExerciseType;
}

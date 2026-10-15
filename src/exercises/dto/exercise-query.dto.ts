import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { EquipmentType, ExerciseType, MovementCategory } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

export class ExerciseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search exercise by name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EquipmentType })
  @IsOptional()
  @IsEnum(EquipmentType)
  equipmentType?: EquipmentType;

  @ApiPropertyOptional({ enum: MovementCategory })
  @IsOptional()
  @IsEnum(MovementCategory)
  movementCategory?: MovementCategory;

  @ApiPropertyOptional({ enum: ExerciseType })
  @IsOptional()
  @IsEnum(ExerciseType)
  exerciseType?: ExerciseType;

  @ApiPropertyOptional({ description: 'Filter by muscle group (e.g. CHEST, BACK, LEGS)' })
  @IsOptional()
  @IsString()
  muscleGroup?: string;

  @ApiPropertyOptional({ description: 'Filter by archived status', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isArchived?: boolean = false;
}

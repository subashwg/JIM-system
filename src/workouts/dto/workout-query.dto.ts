import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkoutStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

export class WorkoutQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter workouts on or after this date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter workouts on or before this date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: WorkoutStatus })
  @IsOptional()
  @IsEnum(WorkoutStatus)
  status?: WorkoutStatus;

  @ApiPropertyOptional({ description: 'Filter by workout type (e.g. Push, Pull, Legs)' })
  @IsOptional()
  @IsString()
  workoutType?: string;

  @ApiPropertyOptional({ description: 'Search in workout name or notes' })
  @IsOptional()
  @IsString()
  search?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { LengthUnit, WeightUnit, FluidUnit, WeekStartDay } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Subash Gautam' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'URL or base64 data of profile avatar image' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 178.5 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: WeightUnit })
  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @ApiPropertyOptional({ enum: LengthUnit })
  @IsOptional()
  @IsEnum(LengthUnit)
  lengthUnit?: LengthUnit;

  @ApiPropertyOptional({ enum: FluidUnit })
  @IsOptional()
  @IsEnum(FluidUnit)
  fluidUnit?: FluidUnit;

  @ApiPropertyOptional({ example: 'Asia/Kathmandu' })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({ enum: WeekStartDay })
  @IsOptional()
  @IsEnum(WeekStartDay)
  weekStartDay?: WeekStartDay;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { LengthUnit, WeightUnit, FluidUnit, WeekStartDay } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ example: 'Subash G' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ example: 178.5, description: 'Height in preferred length unit' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ enum: WeightUnit, default: WeightUnit.KG })
  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @ApiPropertyOptional({ enum: LengthUnit, default: LengthUnit.CM })
  @IsOptional()
  @IsEnum(LengthUnit)
  lengthUnit?: LengthUnit;

  @ApiPropertyOptional({ enum: FluidUnit, default: FluidUnit.ML })
  @IsOptional()
  @IsEnum(FluidUnit)
  fluidUnit?: FluidUnit;

  @ApiPropertyOptional({ example: 'Asia/Kathmandu', default: 'UTC' })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({ enum: WeekStartDay, default: WeekStartDay.MONDAY })
  @IsOptional()
  @IsEnum(WeekStartDay)
  weekStartDay?: WeekStartDay;
}

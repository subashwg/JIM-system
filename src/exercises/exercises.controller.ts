import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service.js';
import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { UpdateExerciseDto } from './dto/update-exercise.dto.js';
import { ExerciseQueryDto } from './dto/exercise-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Exercises')
@Controller('exercises')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter exercises with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of exercises' })
  async findAll(
    @CurrentUser('userId') userId: string,
    @Query() query: ExerciseQueryDto,
  ) {
    return this.exercisesService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise details by ID' })
  @ApiResponse({ status: 200, description: 'Exercise found' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.exercisesService.findOne(id, userId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get user workout performance history for an exercise' })
  @ApiResponse({ status: 200, description: 'Exercise performance history returned' })
  async getHistory(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.exercisesService.getHistory(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom exercise for authenticated user' })
  @ApiResponse({ status: 201, description: 'Exercise created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.exercisesService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a custom exercise' })
  @ApiResponse({ status: 200, description: 'Exercise updated' })
  @ApiResponse({ status: 403, description: 'Cannot update default system exercises' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or archive a custom exercise' })
  @ApiResponse({ status: 200, description: 'Exercise deleted or archived' })
  @ApiResponse({ status: 403, description: 'Cannot delete default system exercises' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.exercisesService.remove(id, userId);
  }
}

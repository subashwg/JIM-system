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
import { WorkoutsService } from './workouts.service.js';
import { CreateWorkoutSessionDto } from './dto/create-workout.dto.js';
import { UpdateWorkoutSessionDto } from './dto/update-workout.dto.js';
import { WorkoutQueryDto } from './dto/workout-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Workouts')
@Controller('workouts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter recorded workouts with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of workouts' })
  async findAll(
    @CurrentUser('userId') userId: string,
    @Query() query: WorkoutQueryDto,
  ) {
    return this.workoutsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workout session details with all exercises, sets, and volume summary' })
  @ApiResponse({ status: 200, description: 'Workout details returned' })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.workoutsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Record a workout session with performed exercises and sets transactionally' })
  @ApiResponse({ status: 201, description: 'Workout successfully created' })
  @ApiResponse({ status: 400, description: 'Validation failed or invalid exercise references' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateWorkoutSessionDto,
  ) {
    return this.workoutsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workout session, exercises, or sets transactionally' })
  @ApiResponse({ status: 200, description: 'Workout updated' })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateWorkoutSessionDto,
  ) {
    return this.workoutsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workout session and cascade delete its exercises and sets' })
  @ApiResponse({ status: 200, description: 'Workout deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.workoutsService.remove(id, userId);
  }
}

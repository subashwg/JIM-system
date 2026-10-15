import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkoutTemplatesService } from './workout-templates.service.js';
import { CreateWorkoutTemplateDto } from './dto/create-template.dto.js';
import { UpdateWorkoutTemplateDto } from './dto/update-template.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Workout Templates')
@Controller('workout-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkoutTemplatesController {
  constructor(private readonly templatesService: WorkoutTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all workout templates for authenticated user' })
  @ApiResponse({ status: 200, description: 'Templates returned' })
  async findAll(@CurrentUser('userId') userId: string) {
    return this.templatesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workout template details by ID' })
  @ApiResponse({ status: 200, description: 'Template returned' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.templatesService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new workout routine template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateWorkoutTemplateDto,
  ) {
    return this.templatesService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workout routine template' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateWorkoutTemplateDto,
  ) {
    return this.templatesService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/delete a workout routine template' })
  @ApiResponse({ status: 200, description: 'Template archived' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.templatesService.remove(id, userId);
  }
}

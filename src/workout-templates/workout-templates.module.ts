import { Module } from '@nestjs/common';
import { WorkoutTemplatesService } from './workout-templates.service.js';
import { WorkoutTemplatesController } from './workout-templates.controller.js';

@Module({
  controllers: [WorkoutTemplatesController],
  providers: [WorkoutTemplatesService],
  exports: [WorkoutTemplatesService],
})
export class WorkoutTemplatesModule {}

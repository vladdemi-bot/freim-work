import { Module } from '@nestjs/common';
import { InMemoryProjectsRepository } from './in-memory-projects.repository';
import { PROJECTS_REPOSITORY } from './projects.repository';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    InMemoryProjectsRepository,
    { provide: PROJECTS_REPOSITORY, useExisting: InMemoryProjectsRepository },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}

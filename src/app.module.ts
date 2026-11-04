import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [ProjectsModule, EventsModule],
})
export class AppModule {}

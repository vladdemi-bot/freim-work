import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  create(@Body() input: CreateProjectDto): Promise<ProjectResponseDto> {
    return this.projects.create(input);
  }

  @Get()
  findAll(): Promise<ProjectResponseDto[]> {
    return this.projects.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProjectResponseDto> {
    return this.projects.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projects.update(id, input);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<ProjectResponseDto> {
    return this.projects.remove(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../common/api-error.dto';
import { ApiProblemResponse } from '../common/api-problem-response.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { createProjectSchema, projectIdSchema, updateProjectSchema } from './project.schemas';
import { env } from '../config/env';

@Controller('projects')
@ApiTags('Projects')
@ApiExtraModels(CreateProjectDto, UpdateProjectDto, ProjectResponseDto, ApiErrorDto)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  @ApiBody({
    schema: { $ref: getSchemaPath(CreateProjectDto) },
    examples: {
      studyFlow: {
        summary: 'Create StudyFlow',
        value: {
          name: 'StudyFlow',
          description: 'A system for managing learning projects.',
          status: 'active',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Project created.',
    type: ProjectResponseDto,
    content: {
      'application/json': {
        examples: {
          createdProject: {
            summary: 'Created project',
            value: {
              id: 10,
              name: 'StudyFlow',
              description: 'A system for managing learning projects.',
              status: 'active',
              createdAt: '2026-09-23T10:00:00.000Z',
            },
          },
        },
      },
    },
  })
  @ApiProblemResponse(400, 'Request validation failed or contains unknown properties.', {
    type: 'https://example.com/problems/validation-error',
    title: 'Request validation failed',
    status: 400,
    detail: 'Request validation failed',
    instance: '/projects',
    code: 'VALIDATION_ERROR',
    requestId: '550e8400-e29b-41d4-a716-446655440000',
    errors: [{ field: 'name', message: 'Name must contain at least 3 characters' }],
  })
  @ApiProblemResponse(409, 'A project with this name already exists.')
  @ApiProblemResponse(500, 'Unexpected server error.')
  create(
    @Body(new ZodValidationPipe(createProjectSchema)) input: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projects.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  @ApiOkResponse({
    description: 'Projects ordered by insertion order.',
    type: ProjectResponseDto,
    isArray: true,
    content: {
      'application/json': {
        examples: {
          projectList: {
            summary: 'Project list',
            value: [{
              id: 10,
              name: 'StudyFlow',
              description: 'A system for managing learning projects.',
              status: 'active',
              createdAt: '2026-09-23T10:00:00.000Z',
            }],
          },
        },
      },
    },
  })
  @ApiProblemResponse(500, 'Unexpected server error.')
  findAll(): Promise<ProjectResponseDto[]> {
    return this.projects.findAll();
  }

  @Get('error/test')
  @ApiExcludeEndpoint()
  triggerTestError(): never {
    if (env.NODE_ENV !== 'development') throw new NotFoundException();
    throw new Error('Test error');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Numeric project ID.', example: 10 })
  @ApiOkResponse({ description: 'Project found.', type: ProjectResponseDto })
  @ApiProblemResponse(400, 'The ID must be a positive integer.')
  @ApiProblemResponse(404, 'Project not found.', {
    type: 'https://example.com/problems/project-not-found',
    title: 'Project not found',
    status: 404,
    detail: 'Project with id 10 was not found',
    instance: '/projects/10',
    code: 'PROJECT_NOT_FOUND',
    requestId: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiProblemResponse(500, 'Unexpected server error.')
  findOne(
    @Param('id', new ZodValidationPipe(projectIdSchema, 'id')) id: number,
  ): Promise<ProjectResponseDto> {
    return this.projects.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', type: Number, description: 'Numeric project ID.', example: 10 })
  @ApiBody({
    schema: { $ref: getSchemaPath(UpdateProjectDto) },
    examples: {
      renameProject: {
        summary: 'Change the project name',
        value: { name: 'StudyFlow 2', status: 'active' },
      },
    },
  })
  @ApiOkResponse({ description: 'Project updated.', type: ProjectResponseDto })
  @ApiProblemResponse(400, 'Request validation failed or the ID is invalid.')
  @ApiProblemResponse(404, 'Project not found.')
  @ApiProblemResponse(409, 'A project with this name already exists.')
  @ApiProblemResponse(500, 'Unexpected server error.')
  update(
    @Param('id', new ZodValidationPipe(projectIdSchema, 'id')) id: number,
    @Body(new ZodValidationPipe(updateProjectSchema)) input: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projects.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', type: Number, description: 'Numeric project ID.', example: 10 })
  @ApiOkResponse({ description: 'Deleted project.', type: ProjectResponseDto })
  @ApiProblemResponse(400, 'The ID must be a positive integer.')
  @ApiProblemResponse(404, 'Project not found.')
  @ApiProblemResponse(500, 'Unexpected server error.')
  remove(
    @Param('id', new ZodValidationPipe(projectIdSchema, 'id')) id: number,
  ): Promise<ProjectResponseDto> {
    return this.projects.remove(id);
  }
}

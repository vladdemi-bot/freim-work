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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../common/api-error.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

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
  @ApiResponse({
    status: 400,
    description: 'Request validation failed or contains unknown properties.',
    type: ApiErrorDto,
    content: {
      'application/json': {
        examples: {
          validationError: {
            summary: 'Invalid request',
            value: {
              statusCode: 400,
              errorCode: 'VALIDATION_ERROR',
              message: 'name must be longer than or equal to 3 characters',
              path: '/projects',
              timestamp: '2026-09-23T10:00:00.000Z',
              traceId: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'A project with this name already exists.', type: ApiErrorDto })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error.', type: ApiErrorDto })
  create(@Body() input: CreateProjectDto): Promise<ProjectResponseDto> {
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
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error.', type: ApiErrorDto })
  findAll(): Promise<ProjectResponseDto[]> {
    return this.projects.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Numeric project ID.', example: 10 })
  @ApiOkResponse({ description: 'Project found.', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'The ID must be an integer.', type: ApiErrorDto })
  @ApiNotFoundResponse({
    description: 'Project not found.',
    type: ApiErrorDto,
    content: {
      'application/json': {
        examples: {
          projectNotFound: {
            summary: 'Unknown project ID',
            value: {
              statusCode: 404,
              errorCode: 'PROJECT_NOT_FOUND',
              message: 'Project with id 10 was not found',
              path: '/projects/10',
              timestamp: '2026-09-23T10:00:00.000Z',
              traceId: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error.', type: ApiErrorDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProjectResponseDto> {
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
  @ApiResponse({ status: 400, description: 'Request validation failed or the ID is not an integer.', type: ApiErrorDto })
  @ApiNotFoundResponse({ description: 'Project not found.', type: ApiErrorDto })
  @ApiResponse({ status: 409, description: 'A project with this name already exists.', type: ApiErrorDto })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error.', type: ApiErrorDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projects.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', type: Number, description: 'Numeric project ID.', example: 10 })
  @ApiOkResponse({ description: 'Deleted project.', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'The ID must be an integer.', type: ApiErrorDto })
  @ApiNotFoundResponse({ description: 'Project not found.', type: ApiErrorDto })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error.', type: ApiErrorDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<ProjectResponseDto> {
    return this.projects.remove(id);
  }
}

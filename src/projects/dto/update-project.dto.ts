import { IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ProjectStatus } from '../project';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

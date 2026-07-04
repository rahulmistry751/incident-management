import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum IncidentStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateIncidentDto {
  @ApiProperty({ description: 'The title of the incident' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ description: 'The description of the incident' })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiPropertyOptional({ enum: IncidentStatus, description: 'The current status of the incident' })
  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @ApiPropertyOptional({ enum: IncidentSeverity, description: 'The severity level of the incident' })
  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;
}

export class GetIncidentsQueryDto {
  @ApiPropertyOptional({ enum: IncidentStatus, description: 'Filter by incident status' })
  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @ApiPropertyOptional({ enum: IncidentSeverity, description: 'Filter by incident severity' })
  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class UpdateIncidentStatusDto {
  @ApiProperty({ enum: IncidentStatus, description: 'The new status of the incident' })
  @IsEnum(IncidentStatus)
  @IsNotEmpty()
  status: IncidentStatus;
}

export class IncidentParamsDto {
  @ApiProperty({ description: 'The UUID of the incident' })
  @IsUUID('4', { message: 'Invalid incident ID format (must be a valid UUID)' })
  id: string;
}

export class IncidentResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ enum: IncidentStatus, enumName: 'IncidentStatus' })
  status: IncidentStatus;

  @ApiProperty({ enum: IncidentSeverity, enumName: 'IncidentSeverity' })
  severity: IncidentSeverity;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class IncidentAnalysisResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  summary: string;

  @ApiProperty({ enum: IncidentSeverity, enumName: 'IncidentSeverity' })
  recommendedSeverity: IncidentSeverity;

  @ApiProperty({ type: String })
  rootCause: string;

  @ApiProperty({ type: String })
  incidentId: string;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class IncidentWithAnalysesResponseDto extends IncidentResponseDto {
  @ApiProperty({ type: () => [IncidentAnalysisResponseDto] })
  analyses: IncidentAnalysisResponseDto[];
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total number of items matching query filters' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages available' })
  totalPages: number;
}

export class PaginatedIncidentResponseDto {
  @ApiProperty({ type: [IncidentResponseDto], description: 'List of incidents for the current page' })
  data: IncidentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata details' })
  meta: PaginationMetaDto;
}

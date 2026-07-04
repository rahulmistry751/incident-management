import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { IncidentsService, NotFoundError } from './incidents.service';
import {
  CreateIncidentDto,
  GetIncidentsQueryDto,
  UpdateIncidentStatusDto,
  IncidentParamsDto,
  IncidentResponseDto,
  IncidentWithAnalysesResponseDto,
  IncidentAnalysisResponseDto,
  PaginatedIncidentResponseDto,
} from './dto/incidents.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@ApiTags('Incidents')
@Controller('api/incidents')
export class IncidentsController {
  constructor(
    private readonly incidentsService: IncidentsService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new incident record' })
  @ApiBody({ type: CreateIncidentDto })
  @ApiResponse({ status: 201, type: IncidentResponseDto })
  async createIncident(@Body() body: CreateIncidentDto) {
    try {
      return await this.incidentsService.createIncident(body);
    } catch (error) {
      throw new InternalServerErrorException('Error creating incident');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve list of incidents with optional filters' })
  @ApiResponse({ status: 200, type: PaginatedIncidentResponseDto })
  async getIncidents(@Query() query: GetIncidentsQueryDto) {
    try {
      return await this.incidentsService.getIncidents(query);
    } catch (error) {
      console.error('Error in getIncidents:', error);
      throw new InternalServerErrorException('Error retrieving incidents');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an incident by its UUID, including AI analysis reports' })
  @ApiResponse({ status: 200, type: IncidentWithAnalysesResponseDto })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async getIncidentById(@Param() params: IncidentParamsDto) {
    try {
      return await this.incidentsService.getIncidentById(params.id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Error retrieving incident');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update the status of an incident' })
  @ApiBody({ type: UpdateIncidentStatusDto })
  @ApiResponse({ status: 200, type: IncidentResponseDto })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async updateIncidentStatus(
    @Param() params: IncidentParamsDto,
    @Body() body: UpdateIncidentStatusDto
  ) {
    try {
      return await this.incidentsService.updateIncidentStatus(params.id, body.status);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Error updating incident status');
    }
  }

  @Post(':id/analyze')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger AI Analysis for an incident and save the results' })
  @ApiResponse({ status: 201, type: IncidentAnalysisResponseDto })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async analyzeIncident(@Param() params: IncidentParamsDto) {
    try {
      return await this.incidentsService.analyzeIncident(params.id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException((error as Error).message || 'Error analyzing incident');
    }
  }

  @Sse(':id/analyze/stream')
  @ApiOperation({ summary: 'Trigger AI Analysis streaming for an incident' })
  @ApiResponse({ status: 200, description: 'Server-Sent Events stream' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  analyzeIncidentStream(@Param() params: IncidentParamsDto): Observable<MessageEvent> {
    try {
      return this.incidentsService.analyzeIncidentStream(params.id).pipe(
        map((event) => ({
          type: event.type,
          data: event.data,
        } as MessageEvent))
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException((error as Error).message || 'Error streaming incident analysis');
    }
  }
}

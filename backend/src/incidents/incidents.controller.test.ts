import 'dotenv/config';
import { describe, it, expect, vi, beforeEach, afterAll, Mock } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { IncidentsRepository } from './incidents.repository';
import { IncidentsModule } from './incidents.module';
import { DatabaseModule, DRIZZLE_PROVIDER } from '../db/database.module';
import { AiModule } from '../ai/ai.module';
import { ValidationPipe } from '@nestjs/common';

describe('Incident API (Integration)', () => {
  let app: NestFastifyApplication;
  let repositoryMock: {
    create: Mock;
    findAll: Mock;
    findById: Mock;
    updateStatus: Mock;
    createAnalysis: Mock;
  };

  beforeEach(async () => {
    repositoryMock = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      createAnalysis: vi.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, AiModule, IncidentsModule],
    })
      .overrideProvider(DRIZZLE_PROVIDER)
      .useValue({})
      .overrideProvider(IncidentsRepository)
      .useValue(repositoryMock)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/incidents', () => {
    it('should create an incident and return 201', async () => {
      const mockIncident = {
        id: '9db2998a-2115-4627-897d-419b46e316a1',
        title: 'API Gateway Timeout',
        description: '504 responses increased by 15%',
        status: 'OPEN',
        severity: 'HIGH',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      repositoryMock.create.mockResolvedValue(mockIncident);

      const response = await app.inject({
        method: 'POST',
        url: '/api/incidents',
        payload: {
          title: 'API Gateway Timeout',
          description: '504 responses increased by 15%',
          severity: 'HIGH',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockIncident);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        title: 'API Gateway Timeout',
        description: '504 responses increased by 15%',
        severity: 'HIGH',
      });
    });

    it('should return 400 Bad Request if title is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/incidents',
        payload: {
          description: 'Incident without title',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.statusCode).toBe(400);
      expect(body.message).toContain('Title is required');
    });
  });

  describe('GET /api/incidents', () => {
    it('should return a list of incidents and filter by status/severity', async () => {
      const mockList = [
        {
          id: '9db2998a-2115-4627-897d-419b46e316a1',
          title: 'Network outage',
          description: 'Fiber line cut',
          status: 'OPEN',
          severity: 'CRITICAL',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      const mockPaginated = {
        data: mockList,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      repositoryMock.findAll.mockResolvedValue(mockPaginated);

      const response = await app.inject({
        method: 'GET',
        url: '/api/incidents?status=OPEN&severity=CRITICAL',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockPaginated);
      expect(repositoryMock.findAll).toHaveBeenCalledWith({
        status: 'OPEN',
        severity: 'CRITICAL',
        page: 1,
        limit: 10,
      });
    });
  });

  describe('GET /api/incidents/:id', () => {
    it('should return incident details and analyses if incident exists', async () => {
      const mockIncident = {
        id: '9db2998a-2115-4627-897d-419b46e316a1',
        title: 'Redis replication lag',
        description: 'Lag exceeded 10s',
        status: 'OPEN',
        severity: 'LOW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analyses: [
          {
            id: 'b8b548b8-07b9-43c2-83b6-17b5fbfb965f',
            summary: 'Summary suggestion.',
            recommendedSeverity: 'LOW',
            rootCause: 'Replication lag caused by heavy write load.',
            incidentId: '9db2998a-2115-4627-897d-419b46e316a1',
            createdAt: new Date().toISOString(),
          },
        ],
      };

      repositoryMock.findById.mockResolvedValue(mockIncident);

      const response = await app.inject({
        method: 'GET',
        url: `/api/incidents/${mockIncident.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockIncident);
    });

    it('should return 404 Not Found if incident does not exist', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/incidents/9db2998a-2115-4627-897d-419b46e316a1',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('not found');
    });

    it('should return 400 Bad Request if incident ID is not a valid UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/incidents/invalid-uuid-string',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message[0]).toContain('must be a valid UUID');
    });
  });

  describe('PATCH /api/incidents/:id', () => {
    it('should update incident status and return 200', async () => {
      const mockIncident = {
        id: '9db2998a-2115-4627-897d-419b46e316a1',
        title: 'CPU spike',
        description: 'VM CPU at 99%',
        status: 'OPEN',
      };
      
      const updatedIncident = {
        ...mockIncident,
        status: 'IN_PROGRESS',
        severity: 'HIGH',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      repositoryMock.findById.mockResolvedValue(mockIncident);
      repositoryMock.updateStatus.mockResolvedValue(updatedIncident);

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/incidents/${mockIncident.id}`,
        payload: {
          status: 'IN_PROGRESS',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('IN_PROGRESS');
      expect(repositoryMock.updateStatus).toHaveBeenCalledWith(mockIncident.id, 'IN_PROGRESS');
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { IncidentsService, NotFoundError } from './incidents.service';
import { IncidentSeverity, IncidentStatus } from './dto/incidents.dto';
import { IncidentsRepository } from './incidents.repository';
import { AiService } from '../ai/ai.service';

describe('IncidentsService (Unit)', () => {
  let incidentRepositoryMock: {
    create: Mock;
    findAll: Mock;
    findById: Mock;
    updateStatus: Mock;
    createAnalysis: Mock;
  };
  let aiServiceMock: {
    analyzeIncident: Mock;
  };
  let incidentService: IncidentsService;

  beforeEach(() => {
    incidentRepositoryMock = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      createAnalysis: vi.fn(),
    };

    aiServiceMock = {
      analyzeIncident: vi.fn(),
    };

    incidentService = new IncidentsService(
      incidentRepositoryMock as unknown as IncidentsRepository,
      aiServiceMock as unknown as AiService
    );
  });

  describe('createIncident', () => {
    it('should create an incident successfully', async () => {
      const mockIncident = {
        id: 'mock-uuid-1',
        title: 'DB Outage',
        description: 'Database is unresponsive',
        status: IncidentStatus.OPEN,
        severity: IncidentSeverity.CRITICAL,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      incidentRepositoryMock.create.mockResolvedValue(mockIncident);

      const result = await incidentService.createIncident({
        title: 'DB Outage',
        description: 'Database is unresponsive',
        severity: IncidentSeverity.CRITICAL,
      });

      expect(incidentRepositoryMock.create).toHaveBeenCalledWith({
        title: 'DB Outage',
        description: 'Database is unresponsive',
        severity: IncidentSeverity.CRITICAL,
      });
      expect(result).toEqual(mockIncident);
    });
  });

  describe('getIncidents', () => {
    it('should retrieve list of incidents', async () => {
      const mockIncidents = [
        { id: '1', title: 'Inc 1', status: IncidentStatus.OPEN },
        { id: '2', title: 'Inc 2', status: IncidentStatus.RESOLVED },
      ];
      const mockPaginated = {
        data: mockIncidents,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      incidentRepositoryMock.findAll.mockResolvedValue(mockPaginated);

      const result = await incidentService.getIncidents({ status: IncidentStatus.OPEN });

      expect(incidentRepositoryMock.findAll).toHaveBeenCalledWith({ status: IncidentStatus.OPEN });
      expect(result).toEqual(mockPaginated);
    });
  });

  describe('getIncidentById', () => {
    it('should return incident with its analyses when it exists', async () => {
      const mockIncident = {
        id: 'mock-uuid-1',
        title: 'DB Outage',
        description: 'Database is unresponsive',
        status: IncidentStatus.OPEN,
        severity: IncidentSeverity.CRITICAL,
        analyses: [
          { id: 'analysis-1', summary: 'Summary of incident' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      incidentRepositoryMock.findById.mockResolvedValue(mockIncident);

      const result = await incidentService.getIncidentById('mock-uuid-1');
      
      expect(incidentRepositoryMock.findById).toHaveBeenCalledWith('mock-uuid-1');
      expect(result).toEqual(mockIncident);
    });

    it('should throw NotFoundError if the incident does not exist', async () => {
      incidentRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        incidentService.getIncidentById('non-existent-uuid')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateIncidentStatus', () => {
    it('should update the incident status when the incident exists', async () => {
      const mockIncident = { id: 'mock-uuid-1', title: 'Test incident' };
      const updatedIncident = { ...mockIncident, status: IncidentStatus.IN_PROGRESS };
      
      incidentRepositoryMock.findById.mockResolvedValue(mockIncident);
      incidentRepositoryMock.updateStatus.mockResolvedValue(updatedIncident);

      const result = await incidentService.updateIncidentStatus('mock-uuid-1', IncidentStatus.IN_PROGRESS);

      expect(incidentRepositoryMock.findById).toHaveBeenCalledWith('mock-uuid-1');
      expect(incidentRepositoryMock.updateStatus).toHaveBeenCalledWith('mock-uuid-1', IncidentStatus.IN_PROGRESS);
      expect(result).toEqual(updatedIncident);
    });

    it('should throw NotFoundError when updating non-existent incident', async () => {
      incidentRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        incidentService.updateIncidentStatus('non-existent-uuid', IncidentStatus.RESOLVED)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('analyzeIncident', () => {
    it('should run AI analysis and save report in the database', async () => {
      const mockIncident = {
        id: 'mock-uuid-1',
        title: 'Slow API',
        description: 'Response times are above 5000ms'
      };
      const mockAiResponse = {
        summary: 'API performance degradation.',
        recommendedSeverity: IncidentSeverity.HIGH,
        rootCause: 'Database locks due to un-indexed query.',
      };
      const mockSavedAnalysis = {
        id: 'analysis-uuid',
        incidentId: 'mock-uuid-1',
        ...mockAiResponse,
        createdAt: new Date(),
      };

      incidentRepositoryMock.findById.mockResolvedValue(mockIncident);
      aiServiceMock.analyzeIncident.mockResolvedValue(mockAiResponse);
      incidentRepositoryMock.createAnalysis.mockResolvedValue(mockSavedAnalysis);

      const result = await incidentService.analyzeIncident('mock-uuid-1');

      expect(incidentRepositoryMock.findById).toHaveBeenCalledWith('mock-uuid-1');
      expect(aiServiceMock.analyzeIncident).toHaveBeenCalledWith('Slow API', 'Response times are above 5000ms');
      expect(incidentRepositoryMock.createAnalysis).toHaveBeenCalledWith('mock-uuid-1', mockAiResponse);
      expect(result).toEqual(mockSavedAnalysis);
    });

    it('should throw NotFoundError if incident to analyze does not exist', async () => {
      incidentRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        incidentService.analyzeIncident('non-existent-uuid')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('analyzeIncidentStream', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should emit progress events, result, and complete', async () => {
      const mockIncident = {
        id: 'mock-uuid-1',
        title: 'Slow API',
        description: 'Response times are above 5000ms'
      };
      const mockAiResponse = {
        summary: 'API performance degradation.',
        recommendedSeverity: IncidentSeverity.HIGH,
        rootCause: 'Database locks due to un-indexed query.',
      };
      const mockSavedAnalysis = {
        id: 'analysis-uuid',
        incidentId: 'mock-uuid-1',
        ...mockAiResponse,
        createdAt: new Date(),
      };

      incidentRepositoryMock.findById.mockResolvedValue(mockIncident);
      aiServiceMock.analyzeIncident.mockResolvedValue(mockAiResponse);
      incidentRepositoryMock.createAnalysis.mockResolvedValue(mockSavedAnalysis);

      const events: any[] = [];
      let isCompleted = false;

      const subscription = incidentService.analyzeIncidentStream('mock-uuid-1').subscribe({
        next: (ev) => events.push(ev),
        complete: () => { isCompleted = true; }
      });

      await vi.advanceTimersByTimeAsync(0);
      expect(events[0]).toEqual({ type: 'progress', data: 'Analyzing incident...' });

      await vi.advanceTimersByTimeAsync(1000);
      expect(events[1]).toEqual({ type: 'progress', data: 'Determining severity...' });

      await vi.advanceTimersByTimeAsync(1000);
      expect(events[2]).toEqual({ type: 'progress', data: 'Generating recommendations...' });

      await vi.runAllTicks();

      expect(events[3]).toEqual({ type: 'result', data: mockSavedAnalysis });
      expect(events[4]).toEqual({ type: 'completed', data: 'done' });
      expect(isCompleted).toBe(true);

      subscription.unsubscribe();
    });

    it('should emit error event and complete gracefully on lookup failure', async () => {
      incidentRepositoryMock.findById.mockResolvedValue(null);

      const events: any[] = [];
      let isCompleted = false;

      incidentService.analyzeIncidentStream('non-existent-uuid').subscribe({
        next: (ev) => events.push(ev),
        complete: () => { isCompleted = true; }
      });

      await vi.advanceTimersByTimeAsync(0);
      expect(events[0]).toEqual({ type: 'progress', data: 'Analyzing incident...' });

      await vi.runAllTicks();

      expect(events[1].type).toBe('error');
      expect(events[1].data).toContain('not found');
      expect(isCompleted).toBe(true);
    });
  });
});

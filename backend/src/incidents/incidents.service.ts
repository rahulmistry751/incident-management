import { Injectable } from '@nestjs/common';
import { IncidentsRepository, CreateIncidentInput, IncidentStatus, IncidentSeverity } from './incidents.repository';
import { AiService } from '../ai/ai.service';
import { Observable } from 'rxjs';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

@Injectable()
export class IncidentsService {
  constructor(
    private incidentRepository: IncidentsRepository,
    private aiService: AiService
  ) {}

  /**
   * Creates a new incident
   */
  async createIncident(data: CreateIncidentInput) {
    return this.incidentRepository.create(data);
  }

  /**
   * Retrieves incidents with optional filters
   */
  async getIncidents(filters: { status?: IncidentStatus; severity?: IncidentSeverity; page?: number; limit?: number } = {}) {
    return this.incidentRepository.findAll(filters);
  }

  /**
   * Retrieves an incident by ID, throwing NotFoundError if it does not exist
   */
  async getIncidentById(id: string) {
    const incident = await this.incidentRepository.findById(id);
    if (!incident) {
      throw new NotFoundError(`Incident with ID ${id} not found`);
    }
    return incident;
  }

  /**
   * Updates status of an incident, throwing NotFoundError if it does not exist
   */
  async updateIncidentStatus(id: string, status: IncidentStatus) {
    const incident = await this.incidentRepository.findById(id);
    if (!incident) {
      throw new NotFoundError(`Incident with ID ${id} not found`);
    }
    return this.incidentRepository.updateStatus(id, status);
  }

  /**
   * Triggers AI Analysis on an incident, stores the result, and returns the analysis report.
   * Throws NotFoundError if the incident does not exist.
   */
  async analyzeIncident(id: string) {
    const incident = await this.incidentRepository.findById(id);
    if (!incident) {
      throw new NotFoundError(`Incident with ID ${id} not found`);
    }

    const analysisResult = await this.aiService.analyzeIncident(
      incident.title,
      incident.description
    );

    return this.incidentRepository.createAnalysis(id, {
      summary: analysisResult.summary,
      recommendedSeverity: analysisResult.recommendedSeverity,
      rootCause: analysisResult.rootCause,
    });
  }

  /**
   * Streams AI Analysis on an incident, stores the completed result, and yields step-by-step progress events.
   * Throws NotFoundError if the incident does not exist.
   */
  analyzeIncidentStream(id: string): Observable<{ type: string; data: any }> {
    return new Observable<{ type: string; data: any }>((subscriber) => {
      let active = true;
      const abortController = new AbortController();
      const timers: NodeJS.Timeout[] = [];

      const emitProgress = (message: string, delay: number): Promise<void> => {
        return new Promise((resolve) => {
          const timer = setTimeout(() => {
            if (active) {
              subscriber.next({ type: 'progress', data: message });
            }
            resolve();
          }, delay);
          timers.push(timer);
        });
      };

      (async () => {
        try {
          // 1. Emit progress: "Analyzing incident..."
          await emitProgress('Analyzing incident...', 0);

          // 2. Retrieve incident
          const incident = await this.incidentRepository.findById(id);
          if (!incident) {
            throw new NotFoundError(`Incident with ID ${id} not found`);
          }

          if (!active) return;

          // 3. Emit progress: "Determining severity..."
          await emitProgress('Determining severity...', 1000);

          if (!active) return;

          // 4. Emit progress: "Generating recommendations..."
          await emitProgress('Generating recommendations...', 1000);

          if (!active) return;

          // 5. Call AI service with signal
          const analysisResult = await this.aiService.analyzeIncident(
            incident.title,
            incident.description,
            abortController.signal
          );

          if (!active) return;

          // 6. Save results to db
          const savedAnalysis = await this.incidentRepository.createAnalysis(id, {
            summary: analysisResult.summary,
            recommendedSeverity: analysisResult.recommendedSeverity as IncidentSeverity,
            rootCause: analysisResult.rootCause,
          });

          if (!active) return;

          // 7. Emit result
          subscriber.next({ type: 'result', data: savedAnalysis });

          // 8. Emit completed
          subscriber.next({ type: 'completed', data: 'done' });
          subscriber.complete();
        } catch (err) {
          if (active) {
            // On failures: emit error event, complete the stream gracefully
            subscriber.next({
              type: 'error',
              data: (err as Error).message || 'An error occurred during AI analysis.',
            });
            subscriber.complete();
          }
        }
      })();

      return () => {
        active = false;
        abortController.abort();
        timers.forEach((timer) => clearTimeout(timer));
      };
    });
  }
}

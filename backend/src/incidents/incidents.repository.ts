import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER, DrizzleDB } from '../db/database.module';
import { incidents, incidentAnalyses } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CreateIncidentInput {
  title: string;
  description: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
}

export interface CreateAnalysisInput {
  summary: string;
  recommendedSeverity: IncidentSeverity;
  rootCause: string;
}

@Injectable()
export class IncidentsRepository {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: DrizzleDB) {}

  /**
   * Creates a new incident in the database
   */
  async create(data: CreateIncidentInput) {
    const [inserted] = await this.db
      .insert(incidents)
      .values({
        title: data.title,
        description: data.description,
        status: data.status ?? 'OPEN',
        severity: data.severity ?? 'LOW',
      })
      .returning();
    return inserted;
  }

  /**
   * Retrieves paginated incidents, optionally filtered by status and/or severity
   */
  async findAll(filters: { status?: IncidentStatus; severity?: IncidentSeverity; page?: number; limit?: number } = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(incidents.status, filters.status));
    }
    if (filters.severity) {
      conditions.push(eq(incidents.severity, filters.severity));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = this.db.select({ count: sql<number>`count(*)` }).from(incidents);
    const totalResult = await (whereClause ? countQuery.where(whereClause) : countQuery);
    const total = Number(totalResult[0]?.count || 0);

    const dataQuery = this.db.select().from(incidents);
    const data = await (whereClause 
      ? dataQuery.where(whereClause).orderBy(desc(incidents.createdAt)).limit(limit).offset(offset)
      : dataQuery.orderBy(desc(incidents.createdAt)).limit(limit).offset(offset)
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Finds a single incident by ID, including its associated AI analyses
   */
  async findById(id: string) {
    const [incident] = await this.db
      .select()
      .from(incidents)
      .where(eq(incidents.id, id));

    if (!incident) {
      return null;
    }

    const analyses = await this.db
      .select()
      .from(incidentAnalyses)
      .where(eq(incidentAnalyses.incidentId, id))
      .orderBy(desc(incidentAnalyses.createdAt));

    return {
      ...incident,
      analyses,
    };
  }

  /**
   * Updates an incident's status
   */
  async updateStatus(id: string, status: IncidentStatus) {
    const [updated] = await this.db
      .update(incidents)
      .set({ status })
      .where(eq(incidents.id, id))
      .returning();
    return updated;
  }

  /**
   * Creates an AI analysis record for a given incident
   */
  async createAnalysis(incidentId: string, data: CreateAnalysisInput) {
    const [inserted] = await this.db
      .insert(incidentAnalyses)
      .values({
        incidentId,
        summary: data.summary,
        recommendedSeverity: data.recommendedSeverity,
        rootCause: data.rootCause,
      })
      .returning();
    return inserted;
  }
}

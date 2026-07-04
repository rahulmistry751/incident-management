import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const statusEnum = pgEnum('status', ['OPEN', 'IN_PROGRESS', 'RESOLVED']);
export const severityEnum = pgEnum('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

// Incident table
export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: statusEnum('status').default('OPEN').notNull(),
  severity: severityEnum('severity').default('LOW').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// IncidentAnalysis table
export const incidentAnalyses = pgTable('incident_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  summary: text('summary').notNull(),
  recommendedSeverity: severityEnum('recommended_severity').notNull(),
  rootCause: text('root_cause').notNull(),
  incidentId: uuid('incident_id')
    .notNull()
    .references(() => incidents.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const incidentsRelations = relations(incidents, ({ many }) => ({
  analyses: many(incidentAnalyses),
}));

export const incidentAnalysesRelations = relations(incidentAnalyses, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentAnalyses.incidentId],
    references: [incidents.id],
  }),
}));

// LLM Config table
export const llmConfigs = pgTable('llm_configs', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// LLM Prompts table
export const llmPrompts = pgTable('llm_prompts', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

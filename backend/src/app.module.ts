import { Module } from '@nestjs/common';
import { DatabaseModule } from './db/database.module';
import { AiModule } from './ai/ai.module';
import { IncidentsModule } from './incidents/incidents.module';

@Module({
  imports: [DatabaseModule, AiModule, IncidentsModule],
})
export class AppModule {}

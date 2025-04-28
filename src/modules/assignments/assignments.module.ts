import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { AssignmentsService } from './assignments.service';
import { AssignmentsResolver } from './assignments.resolver';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [AssignmentsService, AssignmentsResolver],
})
export class AssignmentsModule {}

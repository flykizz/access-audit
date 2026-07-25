import { Module } from '@nestjs/common';
import { ScannerModule } from './scanner/scanner.module';
import { AgentModule } from './agent/agent.module';
import { EngineModule } from './engine/engine.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [ScannerModule, AgentModule, EngineModule, ReportModule],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScannerModule } from './scanner/scanner.module';
import { AgentModule } from './agent/agent.module';
import { EngineModule } from './engine/engine.module';
import { ReportModule } from './report/report.module';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'accessaudit.db',
      entities: [User],
      synchronize: true,
    }),
    ScannerModule,
    AgentModule,
    EngineModule,
    ReportModule,
    AuthModule,
  ],
})
export class AppModule {}
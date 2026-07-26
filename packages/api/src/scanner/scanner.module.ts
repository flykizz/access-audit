import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScannerController } from './scanner.controller';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ScanTask } from './scan-task.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ScanTask])],
  controllers: [ScannerController, TaskController],
  providers: [TaskService],
})
export class ScannerModule {}

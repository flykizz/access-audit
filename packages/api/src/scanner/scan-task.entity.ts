import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

@Entity()
export class ScanTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  userId!: string | null;

  @Column({ type: 'varchar' })
  url!: string;

  @Column({ type: 'simple-json', nullable: true })
  options!: {
    rules?: string[];
    includeHidden?: boolean;
    timeout?: number;
    maxPages?: number;
  } | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: TaskStatus;

  @Column({ type: 'simple-json', nullable: true })
  result!: {
    results: unknown[];
    totalPages: number;
    totalViolations: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    overallScore: number;
  } | null;

  @Column({ type: 'varchar', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'text', nullable: true })
  errorStack!: string | null;

  @Column({ type: 'int', default: 0 })
  currentPage!: number;

  @Column({ type: 'int', default: 0 })
  totalPages!: number;

  @Column({ type: 'int', default: 0 })
  progress!: number;

  @Column({ type: 'int', default: 0 })
  retryCount!: number;

  @Column({ type: 'int', default: 3 })
  maxRetries!: number;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'varchar', nullable: true })
  webhookUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt!: Date | null;
}

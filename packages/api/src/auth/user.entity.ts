import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type AuthProvider = 'email' | 'google' | 'github';
export type UserRole = 'guest' | 'user' | 'vip';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'email' })
  provider!: AuthProvider;

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'int', default: 3 })
  credits!: number;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  role!: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationToken!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: 'datetime', nullable: true })
  passwordResetExpires!: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: 3 })
  credits!: number;

  @Column({ default: false })
  verified!: boolean;

  @Column({ nullable: true })
  verificationToken!: string | null;

  @Column({ nullable: true })
  passwordResetToken!: string | null;

  @Column({ nullable: true })
  passwordResetExpires!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
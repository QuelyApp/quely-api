import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsDate } from 'class-validator';

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  token: string;
}

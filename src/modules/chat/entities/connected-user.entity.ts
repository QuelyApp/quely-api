import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ConnectedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socketId: string;

  @Column()
  userId: string;

  @Column()
  username: string;
}

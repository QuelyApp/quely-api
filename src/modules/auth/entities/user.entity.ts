import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Length, IsEmail } from 'class-validator';
import { RoleTypes } from '@shared/enum/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userid: string;

  @Column({ default: RoleTypes.User })
  role: RoleTypes;

  @Column()
  @Length(4, 16)
  username: string;

  @Column({ nullable: true, default: 'hello, new user' })
  @Length(4, 16)
  state: string;

  @Column({ nullable: true })
  avatarId: string;

  @Column({ nullable: true, default: 'png' })
  avatarType: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, type: 'bytea' })
  avatarBuffer: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @Length(7, 35)
  password: string;

  @Column()
  emailValid: boolean;
}

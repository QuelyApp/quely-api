import { IsEmail, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @Length(3)
  username: string;

  @ApiProperty()
  @Length(8, 32)
  password: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}

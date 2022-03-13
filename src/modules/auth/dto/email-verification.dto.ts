import { IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailVerificationDto {
  @ApiProperty()
  @IsEmail()
  @Length(8, 32)
  email: string;
}

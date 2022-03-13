import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordDto {
  @ApiProperty()
  @Length(8, 32)
  password: string;
}

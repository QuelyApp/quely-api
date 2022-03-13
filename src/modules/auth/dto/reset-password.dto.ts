import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @Length(8, 32)
  password: string;

  @ApiProperty()
  @Length(8, 32)
  password2: string;
}

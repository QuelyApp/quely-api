import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PatchPasswordDto {
  @ApiProperty()
  @Length(8, 32)
  oldPassword: string;

  @ApiProperty()
  @Length(8, 32)
  newPassword: string;

  @ApiProperty()
  @Length(8, 32)
  newPassword2: string;
}

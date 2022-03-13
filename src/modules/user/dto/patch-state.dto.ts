import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PatchStateDto {
  @ApiProperty()
  @Length(3)
  state: string;
}

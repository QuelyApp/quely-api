import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleTypes } from '@shared/enum/role.enum';
import { AuthGuard } from '@shared/guard/auth.guard';

export const Authorize = (role?: RoleTypes) =>
  applyDecorators(SetMetadata('role', role), UseGuards(AuthGuard));

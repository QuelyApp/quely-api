import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Authorize } from '@shared/decorator/auth.decorator';
import { User } from '@shared/decorator/user.decorator';
import { RoleTypes } from '@shared/enum/role.enum';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PatchStateDto } from './dto/patch-state.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/@me')
  @Authorize(RoleTypes.User)
  getUser(@User() user: Auth.User): Promise<Chat.ReturnType<Auth.User>> {
    return this.userService.getUserInfo(user);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('/avatar')
  @Authorize(RoleTypes.User)
  uploadFile(
    @User() user: Auth.User,
    @UploadedFile() file,
  ): Promise<Chat.ReturnType<string>> {
    return this.userService.uploadAvatar(user, file);
  }

  @Get('/avatar/*')
  getFile(@Req() req: FastifyRequest, @Res() rep: FastifyReply) {
    const filePath = req.url.split('/').slice(4).join('');

    return this.userService.getAvatarURL(filePath, rep);
  }

  @Patch('/update-state')
  @Authorize(RoleTypes.User)
  updateState(
    @User() user: Auth.User,
    @Body() field: PatchStateDto,
  ): Promise<Chat.ReturnType<boolean>> {
    return this.userService.updateState(user, field);
  }
}

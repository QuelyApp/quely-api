import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { Authorize } from '@shared/decorator/auth.decorator';
import { User } from '@shared/decorator/user.decorator';
import { RoleTypes } from '@shared/enum/role.enum';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto } from './dto/patch-user.dto';
import { PatchPasswordDto } from './dto/update-password.dto';
import { EmailVerificationDto } from '@modules/auth/dto/email-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() field: CreateUserDto): Promise<Chat.ReturnType<boolean>> {
    return this.authService.createNewUser(field);
  }

  @Post('/login')
  login(@Body() field: CreateUserDto): Promise<Chat.ReturnType<string>> {
    return this.authService.login(field);
  }

  @Post('/password-reset')
  changePassword(
    @Body() field: ResetPasswordDto,
    @Query('token') token,
  ): Promise<Chat.ReturnType<boolean>> {
    return this.authService.passwordReset(field, token);
  }

  @Post('/email-forgot-password/send')
  forgotMyPassword(
    @Body() field: EmailVerificationDto,
  ): Promise<Chat.ReturnType<boolean>> {
    return this.authService.sendForgotPasswordEmailVerification({
      email: field.email,
    });
  }

  @Post('/email-resend-verification/send')
  sendEmailVerification(
    @User() user: Auth.User,
    @Body() field: EmailVerificationDto,
  ): Promise<Chat.ReturnType<boolean>> {
    return this.authService.sendEmailVerification({
      email: field.email,
    });
  }

  @Get('/email/verify')
  emailVerify(@Query('token') token): Promise<Chat.ReturnType<boolean>> {
    return this.authService.emailVerify(token);
  }

  @Patch('/@me')
  @Authorize(RoleTypes.User)
  updateMy(
    @User() user: Auth.User,
    @Body() field: PatchUserDto,
  ): Promise<Chat.ReturnType<string>> {
    return this.authService.updateMy(user, field);
  }

  @Patch('/password')
  @Authorize(RoleTypes.User)
  updatePassword(
    @User() user: Auth.User,
    @Body() password: PatchPasswordDto,
  ): Promise<Chat.ReturnType<string>> {
    return this.authService.updatePassword(user, password);
  }

  @Delete('/@me')
  @Authorize(RoleTypes.User)
  deleteAccount(@User() user: Auth.User): Promise<Chat.ReturnType<boolean>> {
    return this.authService.deleteAccount(user);
  }
}

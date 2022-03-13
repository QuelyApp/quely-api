import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { createTransport } from 'nodemailer';
import { Snowflake } from '@modules/snowflake';
import { RoleTypes } from '@shared/enum/role.enum';
import { PatchPasswordDto } from './dto/update-password.dto';
import { PatchUserDto } from './dto/patch-user.dto';
import { Email } from './entities/email.entity';
import { CONFIG } from '../../config';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  transporter: any;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Email) private emailRepository: Repository<Email>,
    private readonly jwtService: JwtService,
    private readonly snowflake: Snowflake,
  ) {
    this.transporter = createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });
  }

  async createNewUser(field: CreateUserDto): Promise<Chat.ReturnType<boolean>> {
    const email = await this.userRepository.findOne({ email: field.email });
    if (email)
      throw new ConflictException('This email address is already registered');
    const id = this.snowflake.generate();
    const body = {
      userid: id,
      username: field.username,
      password: await bcrypt.hash(field.password, 10),
      email: field.email,
      role: RoleTypes.User,
      emailValid: false,
    };

    const user = await this.userRepository.save(body);

    await this.sendEmailVerification({
      email: field.email,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Account created',
      data: true,
    };
  }

  async login(field: CreateUserDto): Promise<Chat.ReturnType<string>> {
    const user = await this.userRepository.findOne({
      username: field.username,
      email: field.email,
    });
    if (!user) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(field.password, user.password);
    if (!match) throw new UnauthorizedException();

    if (!user.emailValid) throw new ForbiddenException('Email is not approved');

    const token = this.createUserToken(user.userid);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: token,
    };
  }

  async passwordReset(
    field: ResetPasswordDto,
    token: string,
  ): Promise<Chat.ReturnType<boolean>> {
    const decoded = this.jwtService.verify(token);
    if (decoded && !decoded.email) throw new BadRequestException();

    if (decoded && decoded.email && decoded.type == 'forgot') {
      const userFromDB = await this.userRepository.findOne({
        email: decoded.email,
      });

      if (!userFromDB) throw new NotFoundException('User not found');

      if (field.password !== field.password2)
        throw new NotAcceptableException(
          'new password and new password2 do not match',
        );

      await this.userRepository.update(
        {
          email: decoded.email,
        },
        {
          password: await bcrypt.hash(field.password, 10),
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Forgot password successful',
        data: true,
      };
    } else throw new BadRequestException();
  }

  async sendForgotPasswordEmailVerification(
    user: Email.Verify,
  ): Promise<Chat.ReturnType<boolean>> {
    const userFromDB = await this.userRepository.findOne({
      email: user.email,
    });
    if (!userFromDB) throw new NotFoundException('User not found');

    const emailToken = this.jwtService.sign({
      email: user.email,
      type: 'forgot',
    });

    await this.transporter.sendMail({
      from: `Şifremi Unuttum`,
      to: user.email,
      subject: 'Şifre Sıfırlama',
      text: `Şifreni değiştirmek için bu linke tıkla!, \n${CONFIG.URL}/${CONFIG.API_VERSION}/auth/email-forgot-password/verify?token=${emailToken}`,
    });

    await this.emailRepository.save({
      username: userFromDB.username,
      email: user.email,
      token: emailToken,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Email verification sent',
      data: true,
    };
  }

  async sendEmailVerification(
    user: Email.Verify,
  ): Promise<Chat.ReturnType<boolean>> {
    const userFromDB = await this.userRepository.findOne({
      email: user.email,
    });
    if (!userFromDB) throw new NotFoundException('User not found');

    const userGetEmailValid = await this.userRepository.findOne({
      username: userFromDB.username,
      email: user.email,
      emailValid: true,
    });
    if (userGetEmailValid) throw new ConflictException();

    const emailToken = this.jwtService.sign({
      email: user.email,
      type: 'verify',
    });

    await this.transporter.sendMail({
      from: `Email Doğrulama`,
      to: user.email,
      subject: 'Doğrulama',
      text: `Hesabını onaylamak için bu linkle tıkla! \n${CONFIG.URL}/${CONFIG.API_VERSION}/auth/email/verify?token=${emailToken}`,
    });

    await this.emailRepository.save({
      username: userFromDB.username,
      email: user.email,
      token: emailToken,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Email verification sent',
      data: true,
    };
  }

  async emailVerify(token: string): Promise<Chat.ReturnType<boolean>> {
    const decoded = this.jwtService.verify(token);
    if (decoded && !decoded.email) throw new BadRequestException();

    const emailVerify = await this.emailRepository.findOne({
      email: decoded.email,
    });

    if (emailVerify && emailVerify.email) {
      const userFromDB = await this.userRepository.findOne({
        email: emailVerify.email,
      });

      if (!userFromDB) throw new NotFoundException('User not found');

      if (decoded.type === 'verify') {
        await this.userRepository.update(
          { email: userFromDB.email },
          {
            emailValid: true,
          },
        );
      }

      await this.emailRepository.delete({
        token,
        email: emailVerify.email,
      });
    } else throw new NotFoundException();

    return {
      statusCode: HttpStatus.OK,
      message: 'Email verified',
      data: true,
    };
  }

  async updatePassword(
    user: Auth.User,
    password: PatchPasswordDto,
  ): Promise<Chat.ReturnType<string>> {
    const getUser = await this.userRepository.findOne({ userid: user.id });
    if (!getUser) throw new NotFoundException('User not found');

    if (password.newPassword !== password.newPassword2)
      throw new NotAcceptableException(
        'new password and new password2 do not match',
      );

    const match = await bcrypt.compare(password.oldPassword, getUser.password);
    if (!match) throw new UnauthorizedException("Old password doesn't matches");

    const newPassword = await bcrypt.hash(password.newPassword, 10);

    const body = {
      password: newPassword,
    };

    await this.userRepository.update(
      { userid: user.id, email: user.email },
      body,
    );

    const token = this.createUserToken(user.id);

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: token,
    };
  }

  async updateMy(
    user: Auth.User,
    newUser: PatchUserDto,
  ): Promise<Chat.ReturnType<string>> {
    const getUser = await this.userRepository.findOne({ userid: user.id });
    if (!getUser) throw new NotFoundException('User not found');

    let username =
      !!newUser.username && newUser.username != getUser.username
        ? newUser.username
        : getUser.username;
    let email =
      !!newUser.email && newUser.email != getUser.email
        ? newUser.email
        : getUser.email;

    await this.userRepository.update(
      { userid: getUser.userid, email: getUser.email },
      { username, email },
    );

    const token = this.createUserToken(user.id);

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: token,
    };
  }

  async deleteAccount(user: Auth.User): Promise<Chat.ReturnType<boolean>> {
    const getUser = await this.userRepository.findOne({ userid: user.id });
    if (!getUser) throw new NotFoundException('User not found');

    await this.userRepository.delete({
      userid: user.id,
      email: user.email,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: true,
    };
  }

  createUserToken(id: string): string {
    const token = this.jwtService.sign(
      { id: id },
      {
        expiresIn: 1000 * 60 * 60 * 24 * 365,
      },
    );
    return token;
  }
}

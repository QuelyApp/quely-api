import { User } from '@modules/auth/entities/user.entity';
import { Snowflake } from '@modules/snowflake';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FastifyReply } from 'fastify';
import { CONFIG } from 'src/config';
import { Repository } from 'typeorm';
import { PatchStateDto } from './dto/patch-state.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly snowflake: Snowflake,
  ) {}

  getType(mimeType: string): string {
    switch (mimeType) {
      case 'image/gif':
        return 'gif';

      case 'image/png':
        return 'png';

      case 'image/jpg':
        return 'jpg';
    }
  }

  async getUsers(): Promise<Chat.ReturnType<Auth.Users[]>> {
    const getUsers = await this.userRepository.find();
    if (!getUsers) throw new NotFoundException('Users not found');

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: getUsers.map((user) => {
        return {
          id: user.userid,
          username: user.username,
          avatar: user.avatar,
        };
      }),
    };
  }

  async updateState(
    user: Auth.User,
    field: PatchStateDto,
  ): Promise<Chat.ReturnType<boolean>> {
    const userFromDB = await this.userRepository.findOne({
      userid: user.id,
      email: user.email,
    });
    if (!userFromDB) throw new NotFoundException('User not found');

    if (userFromDB.state === field.state)
      throw new ConflictException('User state is already set to this value');

    await this.userRepository.update(
      {
        userid: user.id,
        email: user.email,
      },
      {
        state: field.state,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: true,
    };
  }

  async uploadAvatar(user: Auth.User, file): Promise<Chat.ReturnType<string>> {
    const userFromDB = await this.userRepository.findOne({
      userid: user.id,
      email: user.email,
    });
    if (!userFromDB) throw new NotFoundException('User not found');

    const id = this.snowflake.generate();
    const getType = this.getType(file.mimetype);
    const imageUrl = `${CONFIG.URL}/${CONFIG.API_VERSION}/user/avatar/${id}.${getType}`;

    await this.userRepository.update(
      {
        userid: user.id,
        email: user.email,
      },
      {
        avatarId: id,
        avatarType: getType,
        avatar: imageUrl,
        avatarBuffer: file.buffer,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: imageUrl,
    };
  }

  async getAvatarURL(filePath: string, rep: FastifyReply) {
    const id = filePath.split('.')[0];
    const type = filePath.split('.')[1];

    const data = await this.userRepository.findOne({
      avatarId: id,
      avatarType: type,
    });
    if (!data) throw new BadRequestException();
    const mime = 'image/' + data.avatarType;

    rep.header('Content-Type', mime).send(data.avatarBuffer);
  }

  async getUserInfo(user: Auth.User): Promise<Chat.ReturnType<Auth.User>> {
    const getUser = await this.userRepository.findOne({ userid: user.id });
    if (!getUser) throw new NotFoundException('User not found');

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: {
        id: getUser.userid,
        username: getUser.username,
        email: getUser.email,
        role: getUser.role,
        emailValid: getUser.emailValid,
        state: getUser.state,
        avatar: getUser.avatar,
      },
    };
  }
}

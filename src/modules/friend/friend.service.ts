import { User } from '@modules/auth/entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from './entities/friend.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async addFriend(
    id: string,
    user: Auth.User,
  ): Promise<Chat.ReturnType<boolean>> {
    const friendFromDb = await this.userRepository.findOne({
      userid: id,
    });
    if (!friendFromDb) throw new NotFoundException('User not found');

    const friend = await this.friendRepository.findOne({
      uid: user.id,
      friend: id,
      status: true,
    });
    if (friend) throw new ConflictException('User is already your friend');

    await this.friendRepository.save({
      uid: user.id,
      username: user.username,
      friend: id,
      status: false,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'successful',
      data: true,
    };
  }

  async removeFriend(
    id: string,
    user: Auth.User,
  ): Promise<Chat.ReturnType<boolean>> {
    const friendFromDb = await this.userRepository.findOne({
      userid: id,
    });
    if (!friendFromDb) throw new NotFoundException('User not found');

    const friend = await this.friendRepository.findOne({
      uid: user.id,
      friend: id,
      status: true,
    });
    if (!friend) throw new ConflictException('User is not already your friend');

    await this.friendRepository.delete({
      uid: id,
      username: friendFromDb.username,
      friend: user.id,
      status: true,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: true,
    };
  }

  async acceptFriend(
    id: string,
    user: Auth.User,
  ): Promise<Chat.ReturnType<boolean>> {
    const friendFromDb = await this.userRepository.findOne({
      userid: id,
    });
    if (!friendFromDb) throw new NotFoundException('User not found');

    const friend = await this.friendRepository.findOne({
      uid: id,
      friend: user.id,
      status: false,
    });
    if (!friend) throw new NotFoundException('Friend request not found');

    await this.friendRepository.update(
      {
        uid: friendFromDb.userid,
        username: friendFromDb.username,
        friend: user.id,
        status: false,
      },
      {
        status: true,
      },
    );

    await this.friendRepository.save({
      uid: user.id,
      username: user.username,
      friend: friendFromDb.userid,
      status: true,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: true,
    };
  }

  async getFriendRequests(
    user: Auth.User,
  ): Promise<Chat.ReturnType<Friend.Request[]>> {
    const friend = await this.friendRepository.find({
      friend: user.id,
      status: false,
    });
    if (!friend) throw new NotFoundException('User has no friend requests');

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: friend.map((f) => {
        return {
          uid: f.uid,
          username: f.username,
        };
      }),
    };
  }

  async getFriends(
    user: Auth.User,
  ): Promise<Chat.ReturnType<Friend.Request[]>> {
    const friend = await this.friendRepository.find({
      friend: user.id,
      status: true,
    });
    if (!friend) throw new NotFoundException('User has no friend');

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: friend.map((f) => {
        return {
          uid: f.uid,
          username: f.username,
        };
      }),
    };
  }
}

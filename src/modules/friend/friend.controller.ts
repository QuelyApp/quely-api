import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Authorize } from '@shared/decorator/auth.decorator';
import { User } from '@shared/decorator/user.decorator';
import { RoleTypes } from '@shared/enum/role.enum';
import { FriendService } from './friend.service';

@Controller('friend')
@Authorize(RoleTypes.User)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post(':id')
  getFriendRequest(
    @User() user: Auth.User,
    @Param('id') id: string,
  ): Promise<Chat.ReturnType<boolean>> {
    return this.friendService.addFriend(id, user);
  }

  @Post('/accept/:id')
  addFriend(
    @User() user: Auth.User,
    @Param('id') id: string,
  ): Promise<Chat.ReturnType<boolean>> {
    return this.friendService.acceptFriend(id, user);
  }

  @Get('/requests')
  friendRequests(
    @User() user: Auth.User,
  ): Promise<Chat.ReturnType<Friend.Request[]>> {
    return this.friendService.getFriendRequests(user);
  }

  @Get('/friends')
  getFriends(
    @User() user: Auth.User,
  ): Promise<Chat.ReturnType<Friend.Request[]>> {
    return this.friendService.getFriends(user);
  }

  @Delete(':id')
  removeFriends(
    @User() user: Auth.User,
    @Param('id') id: string,
  ): Promise<Chat.ReturnType<boolean>> {
    return this.friendService.removeFriend(id, user);
  }
}

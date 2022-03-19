import { BadGatewayException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '@modules/auth/entities/user.entity';
import { Friend } from '@modules/friend/entities/friend.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  token: any;
  messages: any[] = [];

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Friend) private friendRepoistory: Repository<Friend>,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection() {
    console.log('Biri bağlandı');
  }

  handleDisconnect() {
    console.log('Biri düştü');
  }

  @SubscribeMessage('auth')
  async auth(socket, token: string): Promise<Boolean> {
    const tokenisValid = await this.isValidJwt(token);
    if (!tokenisValid) throw new BadGatewayException();

    this.token = tokenisValid;
    return true;
  }

  @SubscribeMessage('getRoomMessages')
  async getRoomMessages(socket, id: string): Promise<Boolean> {
    if (!this.token) throw new BadGatewayException();

    const userFromDb = await this.userRepository.findOne({ userid: id });
    if (!userFromDb) throw new BadGatewayException();

    const getUserById = await this.getUserById();
    if (!getUserById) throw new BadGatewayException();

    const r = [...socket.rooms].filter((a) =>
      a.includes(`chat:${getUserById}-${id}`),
    );
    if (!r) throw new BadGatewayException();

    this.server.emit('messages', this.messages);

    return true;
  }

  @SubscribeMessage('createMessage')
  async createMessage(socket, data): Promise<Boolean> {
    if (!this.token) throw new BadGatewayException();

    const userFromDb = await this.userRepository.findOne({ userid: data[0] });
    if (!userFromDb) throw new BadGatewayException();

    const getUserById = await this.getUserById();
    if (!getUserById) throw new BadGatewayException();

    const r = [...socket.rooms].filter((a) =>
      a.includes(`chat:${getUserById}-${data[0]}`),
    );
    if (!r) throw new BadGatewayException();

    this.messages.push({
      authorId: getUserById,
      message: data[1],
    });
    this.server.emit('messages', this.messages);

    return true;
  }

  @SubscribeMessage('createRoom')
  async createRoom(socket, id: string): Promise<Boolean> {
    if (!this.token) throw new BadGatewayException();

    const userFromDb = await this.userRepository.findOne({ userid: id });
    if (!userFromDb) throw new BadGatewayException();

    const getUserById = await this.getUserById();
    if (!getUserById) throw new BadGatewayException();

    const getFriendById = await this.friendRepoistory.findOne({
      uid: getUserById,
      friend: id,
      status: true,
    });
    if (!getFriendById) throw new BadGatewayException();

    this.server.socketsJoin(`chat:${getUserById}-${id}`);
    this.server.emit('getRooms', [...socket.rooms]);

    return true;
  }

  @SubscribeMessage('deleteRoom')
  async deleteRoom(socket, id: string): Promise<Boolean> {
    if (!this.token) throw new BadGatewayException();

    const userFromDb = await this.userRepository.findOne({ userid: id });
    if (!userFromDb) throw new BadGatewayException();

    const getUserById = await this.getUserById();
    if (!getUserById) throw new BadGatewayException();

    const r = [...socket.rooms].filter((a) =>
      a.includes(`chat:${getUserById}-${id}`),
    );
    if (!r) throw new BadGatewayException();

    this.server.socketsLeave(`chat:${getUserById}-${id}`);
    this.server.emit('getRooms', [...socket.rooms]);

    return true;
  }

  async isValidJwt(token: string): Promise<Boolean | String> {
    if (!token) return false;
    let decoded = await this.jwtService.verify(token);

    if (!decoded || (decoded && !decoded.id)) return false;

    const user = await this.userRepository.findOne({ userid: decoded.id });
    if (!user) return false;
    return token;
  }

  async getUserById(): Promise<any> {
    const token = this.token;
    if (!token) return false;

    let decoded = await this.jwtService.verify(token);
    if (!decoded || (decoded && !decoded.id)) return false;

    const user = await this.userRepository.findOne({ userid: decoded.id });
    if (!user) return false;

    return user.userid;
  }
}

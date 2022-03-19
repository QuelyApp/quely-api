import { InjectRepository } from '@nestjs/typeorm';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { ConnectedUser } from './entities/connected-user.entity';

@WebSocketGateway({ cors: {origin: "*"} })

export class ChatGateway {
  @WebSocketServer() wss: Server;

  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(ConnectedUser) private readonly connectedUserRepository: Repository<ConnectedUser>,
  ) {}

  async handleConnection(socket) {
    const roomId = socket.id;
    await this.connectedUserRepository.save({
      socketId: roomId,
      userId: '3x21',
      username: 'test',
    });
    const rooms = await this.chatService.getRooms();

    this.wss.to(socket.id).emit("rooms", rooms)
  }

  handleDisconnect() {
    console.log('disconnected');
  }

  @SubscribeMessage('identity')
  identity(): string {
    return "s";
  }
}

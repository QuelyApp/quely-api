import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { ConnectedUser } from './entities/connected-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, ConnectedUser]),
  ],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}

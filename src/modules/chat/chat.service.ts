import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectedUser } from './entities/connected-user.entity';
import { Room } from './entities/room.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ConnectedUser) private readonly connectedUserRepository: Repository<ConnectedUser>,
        @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    ) {}
    
    joinRoom(roomId: string) {
        console.log('joined room', roomId);
    }
    
    async getRooms() {
        const rooms = await this.roomRepository.find();

        return rooms;
    }
}

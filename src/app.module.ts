import { Email } from '@modules/auth/entities/email.entity';
import { User } from '@modules/auth/entities/user.entity';
import { ChatModule } from '@modules/chat/chat.module';
import { Friend } from '@modules/friend/entities/friend.entity';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { FriendModule } from './modules/friend/friend.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES.HOST'),
        port: configService.get<number>('POSTGRES.PORT'),
        username: configService.get<string>('POSTGRES.USERNAME'),
        password: configService.get<string>('POSTGRES.PASSWORD'),
        database: configService.get<string>('POSTGRES.DATABASE'),
        entities: [User, Email, Friend],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    FriendModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { User } from '@modules/auth/entities/user.entity';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (!token) return false;

    const decoded = this.jwtService.verify(token);
    const roles = this.reflector.get('role', context.getHandler());

    if (decoded && decoded.id) {
      const user = await this.userRepository.findOne({
        userid: decoded.id,
      });
      if (!user) throw new BadRequestException();

      request.user = {
        id: user.userid,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      return true;
    }
    return false;
  }
}

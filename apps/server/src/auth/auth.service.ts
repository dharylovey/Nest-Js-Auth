import { UserService } from './../user/user.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { jwtVerify, SignJWT } from 'jose';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
  ) {}

  async me(token: string) {
    const user = await this.verifyToken(token);

    const userId = user.payload.sub;
    return this.userService.findOne(String(userId));
  }

  async register(email: string, password: string) {
    const existingUser = await this.userService.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await this.hashPassword(password);
    const data = await this.userService.createUser(email, hashedPassword);

    return { message: 'User created successfully', success: true, data };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const comparePassword = await verify(user.password, password);
    if (!comparePassword) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return await this.generateToken(user.id, user.email);
  }

  async generateToken(userId: string, email: string) {
    const secret = this.config.get<string>('JWT_SECRET');
    const payload = new TextEncoder().encode(secret);
    const result = await new SignJWT({ userId, email })
      .setProtectedHeader({
        alg: 'HS256',
        typ: 'JWT',
      })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(payload);

    return { userId, email, token: result };
  }

  async verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const payload = new TextEncoder().encode(secret);
    try {
      return await jwtVerify(token, payload);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException({
        message: 'Invalid token',
      });
    }
  }

  async hashPassword(password: string) {
    return await hash(password);
  }
}

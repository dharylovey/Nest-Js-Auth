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
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await hash(password);
    return this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

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
    const secret = this.config.get<string>('JWT_SECRET');
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
}

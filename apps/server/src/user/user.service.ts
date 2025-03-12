import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(email: string, hashPassword: string) {
    return await this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
      },
      select: {
        id: true,
        email: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<unknown> {
    return await this.prisma.user.findUnique({ where: { email } });
  }
}

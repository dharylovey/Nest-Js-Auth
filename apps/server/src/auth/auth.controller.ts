import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { z } from 'zod';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type SchemaDTO = z.infer<typeof schema>;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() body: SchemaDTO) {
    const validatedFields = schema.safeParse(body);
    if (!validatedFields.success) {
      throw new BadRequestException('Invalid fields');
    }
    const { email, password } = validatedFields.data;
    return this.authService.register(email, password);
  }

  @Post('login')
  async login(@Body() body: SchemaDTO, @Res() res: Response) {
    const validatedFields = schema.safeParse(body);
    if (!validatedFields.success) {
      throw new BadRequestException('Invalid fields');
    }

    const { email, password } = validatedFields.data;

    const user = await this.authService.login(email, password);

    res.cookie('authUser', user.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('NODE_ENV') === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.json({ message: 'Login successful', user });
  }
}

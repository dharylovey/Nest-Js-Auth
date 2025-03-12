import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { z } from 'zod';
import { Response, Request } from 'express';
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

  @Get('me')
  async getMe(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid user');
    }
    return this.authService.me(token);
  }

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

    const data = await this.authService.login(email, password);

    res.cookie('authUser', data.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('NODE_ENV') === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.json({ message: 'Login successful', data });
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('authUser');
    return res.json({ message: 'Logout successful', success: true });
  }
}

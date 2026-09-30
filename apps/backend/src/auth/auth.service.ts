import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

function publicUser(u: {
  id: string;
  email: string;
  username: string;
  languagePref: string;
  competitiveMode: boolean;
  avatarUrl: string | null;
}) {
  return u;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private signAccess(userId: string, email: string) {
    return this.jwt.sign(
      { sub: userId, email },
      {
        secret: this.config.get('JWT_ACCESS_SECRET', 'dev-access-secret-change-me-32chars!!'),
        expiresIn: this.config.get('JWT_ACCESS_TTL', '15m'),
      },
    );
  }

  private signRefresh(userId: string, email: string) {
    return this.jwt.sign(
      { sub: userId, email, type: 'refresh' },
      {
        secret: this.config.get('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me-32chars!'),
        expiresIn: this.config.get('JWT_REFRESH_TTL', '7d'),
      },
    );
  }

  private tokens(userId: string, email: string) {
    return {
      accessToken: this.signAccess(userId, email),
      refreshToken: this.signRefresh(userId, email),
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const username = dto.username.trim();

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === email ? 'Email already registered' : 'Username already taken',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        languagePref: 'en',
        competitiveMode: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        languagePref: true,
        competitiveMode: true,
        avatarUrl: true,
      },
    });

    return { user: publicUser(user), ...this.tokens(user.id, user.email) };
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim();
    const isEmail = identifier.includes('@');
    const user = await this.prisma.user.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { username: identifier },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash: _ph, ...rest } = user;
    void _ph;
    return {
      user: {
        id: rest.id,
        email: rest.email,
        username: rest.username,
        languagePref: rest.languagePref,
        competitiveMode: rest.competitiveMode,
        avatarUrl: rest.avatarUrl,
      },
      ...this.tokens(user.id, user.email),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; type?: string }>(
        refreshToken,
        {
          secret: this.config.get('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me-32chars!'),
        },
      );
      if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token');
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('Invalid refresh token');
      return this.tokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        languagePref: true,
        competitiveMode: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}

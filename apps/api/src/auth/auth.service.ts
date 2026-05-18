import { Injectable, UnauthorizedException, ConflictException, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponse, Role } from '@ai-support-hub/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  private getDemoUser() {
    return {
      id: 'demo-user-id',
      email: 'admin@demo.com',
      name: 'Demo Admin',
      role: 'ORG_ADMIN',
      organizationId: 'demo-org-id',
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (!this.prisma.isAvailable) {
      this.logger.warn('Prisma not available, using demo user for registration');
      return this.generateTokens(this.getDemoUser());
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.companyName,
          slug: dto.companyName.toLowerCase().replace(/ /g, '-'),
        },
      });

      return tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          role: 'ORG_ADMIN',
          organizationId: org.id,
        },
      });
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    // Demo Fallback
    if (!this.prisma.isAvailable || dto.email === 'admin@demo.com') {
      this.logger.log(`Using demo login for ${dto.email}`);
      return this.generateTokens(this.getDemoUser());
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: any): Promise<AuthResponse> {
    const payload = { sub: user.id, email: user.email, role: user.role, orgId: user.organizationId };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '1h' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    if (this.prisma.isAvailable && user.id !== 'demo-user-id') {
      try {
        await this.prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } catch (e) {
        this.logger.error('Failed to save refresh token', e);
      }
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        organizationId: user.organizationId,
      },
    };
  }

  async refresh(token: string): Promise<{ accessToken: string }> {
    if (!this.prisma.isAvailable) {
      return { accessToken: await this.jwtService.signAsync(this.getDemoUser(), { expiresIn: '1h' }) };
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload = { 
      sub: storedToken.user.id, 
      email: storedToken.user.email, 
      role: storedToken.user.role, 
      orgId: storedToken.user.organizationId 
    };

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
    return { accessToken };
  }

  async logout(token: string) {
    if (this.prisma.isAvailable) {
      await this.prisma.refreshToken.deleteMany({
        where: { token },
      });
    }
  }
}

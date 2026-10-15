import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { WeightUnit, LengthUnit, FluidUnit, WeekStartDay } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  const mockJwt = {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com' });

      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        displayName: 'Test User',
      };

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should successfully create a new user with hashed password and profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        role: 'USER',
        profile: {
          id: 'p1',
          userId: 'u1',
          displayName: 'Test User',
          weightUnit: WeightUnit.KG,
          lengthUnit: LengthUnit.CM,
          fluidUnit: FluidUnit.ML,
          timeZone: 'UTC',
          weekStartDay: WeekStartDay.MONDAY,
        },
      });

      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        displayName: 'Test User',
      };

      const result = await service.register(dto);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile preferences', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' });
      mockPrisma.userProfile.update.mockResolvedValue({
        id: 'p1',
        userId: 'u1',
        displayName: 'Updated Name',
        weightUnit: WeightUnit.LB,
      });

      const result = await service.updateProfile('u1', {
        displayName: 'Updated Name',
        weightUnit: WeightUnit.LB,
      });

      expect(result.profile.displayName).toBe('Updated Name');
      expect(result.profile.weightUnit).toBe(WeightUnit.LB);
    });
  });
});

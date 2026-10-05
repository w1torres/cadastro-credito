import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  paginate,
  PaginatedResult,
} from '../common/types/paginated-result.type.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { User } from '@prisma/client';


export type SafeUser = Omit<User, 'passwordHash'> & {
  branch: { id: string; name: string } | null;
};

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  branchId: true,
  codigo: true,
  branch: { select: { id: true, name: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Record<keyof Omit<User, 'passwordHash'> | 'branch', unknown>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cadastro pelo ADMIN. Não há senha: o usuário entra só pelo Entra ID, então
   * o e-mail precisa ser o mesmo da conta Microsoft.
   */
  async create(dto: CreateUserDto): Promise<SafeUser> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        role: dto.role,
        branchId: dto.branchId,
        codigo: dto.codigo?.toUpperCase(),
      },
      select: SAFE_USER_SELECT,
    });
  }

  async findAll(
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<SafeUser>> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: SAFE_USER_SELECT,
      }),
      this.prisma.user.count(),
    ]);
    return paginate(users, total, page, pageSize);
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { ...dto, codigo: dto.codigo?.toUpperCase() },
      select: SAFE_USER_SELECT,
    });
  }
}

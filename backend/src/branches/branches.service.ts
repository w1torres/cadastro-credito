import { Injectable } from '@nestjs/common';
import { Branch } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Branch[]> {
    return this.prisma.branch.findMany({ orderBy: { name: 'asc' } });
  }
}

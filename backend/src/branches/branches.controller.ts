import { Controller, Get } from '@nestjs/common';
import { Branch } from '@prisma/client';
import { BranchesService } from './branches.service.js';

/** Lista simples, sem RBAC próprio: usada pelo formulário de usuários (ADMIN) e para exibir o nome da filial em telas de qualquer papel autenticado. */
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  findAll(): Promise<Branch[]> {
    return this.branchesService.findAll();
  }
}

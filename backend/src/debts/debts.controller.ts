import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  create(@Request() req, @Body() createDebtDto: CreateDebtDto) {
    return this.debtsService.create(req.user.userId, createDebtDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.debtsService.findAll(req.user.userId);
  }

  @Patch(':id/payment')
  addPayment(
    @Request() req,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    console.log(amount, typeof amount);
    return this.debtsService.addPayment(+id, req.user.userId, amount);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.debtsService.remove(+id, req.user.userId);
  }
}
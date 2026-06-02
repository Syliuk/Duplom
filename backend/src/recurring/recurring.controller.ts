import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { RecurringService } from './recurring.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Recurring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Post()
  create(@Request() req, @Body() createRecurringDto: CreateRecurringDto) {
    return this.recurringService.create(req.user.userId, createRecurringDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.recurringService.findAll(req.user.userId);
  }

  @Patch(':id/toggle')
  toggleActive(@Request() req, @Param('id') id: string) {
    return this.recurringService.toggleActive(+id, req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.recurringService.remove(+id, req.user.userId);
  }
}
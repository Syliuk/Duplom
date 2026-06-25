import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Post()
  create(
    @Request() req,
    @Body() createCategoryDto: CreateCategoryDto,
    @Query('name') queryName?: string,
    @Query('type') queryType?: 'income' | 'expense',
  ) {
    const body = createCategoryDto ?? {};
    return this.categoriesService.create(req.user.userId, {
      ...body,
      name: body.name ?? queryName,
      type: body.type ?? queryType,
    });
  }
}

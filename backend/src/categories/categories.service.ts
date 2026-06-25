import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

const DEFAULT_CATEGORIES: Array<{ name: string; type: 'income' | 'expense' }> = [
  { name: 'Salary', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Business', type: 'income' },
  { name: 'Investments', type: 'income' },
  { name: 'Gift', type: 'income' },
  { name: 'Other', type: 'income' },
  { name: 'Food', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Bills', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Other', type: 'expense' },
];

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(userId: number) {
    await this.ensureDefaultCategories(userId);

    return this.categoriesRepository.find({
      where: { userId },
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  async create(userId: number, dto: CreateCategoryDto) {
    const name = dto.name?.trim();

    if (!name) {
      throw new BadRequestException('Category name is required');
    }

    if (!['income', 'expense'].includes(dto.type)) {
      throw new BadRequestException('Category type is invalid');
    }

    const existing = await this.categoriesRepository.findOne({
      where: { userId, type: dto.type, name },
    });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    const category = this.categoriesRepository.create({
      userId,
      type: dto.type,
      name,
    });

    return this.categoriesRepository.save(category);
  }

  private async ensureDefaultCategories(userId: number) {
    const existing = await this.categoriesRepository.find({ where: { userId } });
    const existingKeys = new Set(existing.map((category) => `${category.type}:${category.name}`));
    const missing = DEFAULT_CATEGORIES
      .filter((category) => !existingKeys.has(`${category.type}:${category.name}`))
      .map((category) => this.categoriesRepository.create({ ...category, userId }));

    if (missing.length > 0) {
      await this.categoriesRepository.save(missing);
    }
  }
}

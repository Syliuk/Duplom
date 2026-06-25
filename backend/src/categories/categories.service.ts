import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

const isDefaultCategory = (type: 'income' | 'expense', name: string) =>
  DEFAULT_CATEGORIES.some((category) => category.type === type && category.name === name);

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

  async create(userId: number, dto: CreateCategoryDto | string | any) {
    const rawName = typeof dto === 'string'
      ? dto
      : dto?.name ?? dto?.title ?? dto?.category ?? dto?.categoryName;
    const name = String(rawName ?? '').trim();
    const type = typeof dto === 'string' ? 'expense' : dto?.type;

    if (!name) {
      throw new BadRequestException('Category name is required');
    }

    if (!['income', 'expense'].includes(type)) {
      throw new BadRequestException('Category type is invalid');
    }

    const existing = await this.categoriesRepository.findOne({
      where: { userId, type, name },
    });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    const category = this.categoriesRepository.create({
      userId,
      type,
      name,
    });

    return this.categoriesRepository.save(category);
  }

  async remove(userId: number, id: number) {
    const category = await this.categoriesRepository.findOne({ where: { id, userId } });
    if (!category) throw new NotFoundException('Category not found');

    if (isDefaultCategory(category.type, category.name)) {
      throw new BadRequestException('Default categories cannot be deleted');
    }

    await this.categoriesRepository.delete({ id, userId });
    return { message: 'Category deleted' };
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async updateProfile(userId: number, data: { name?: string; email?: string }) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Користувача не знайдено');

    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;

    await this.usersRepository.save(user);
    return user;
  }

  async findOne(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }
}
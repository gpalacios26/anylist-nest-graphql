import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto';
import { UpdateUserInput } from './dto';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {

  private logger = new Logger('UsersService')

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) { }

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10)
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0) {
      return await this.usersRepository.find();
    }

    return await this.usersRepository.createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException(`${email} not found`);
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException(`${id} not found`);
    }
  }

  async block(id: string, updateBy: User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = updateBy;
    return await this.usersRepository.save(userToBlock);
  }

  async update(id: string, updateUserInput: UpdateUserInput, updateBy: User): Promise<User> {
    try {
      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id
      });

      user.lastUpdateBy = updateBy;
      return await this.usersRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      this.logger.error(error);
      throw new BadRequestException(error.detail.replace('Key', ''));
    }

    if (error.code == 'error-001') {
      this.logger.error(error);
      throw new BadRequestException(error.detail.replace('Key', ''));
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}

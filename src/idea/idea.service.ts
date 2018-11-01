import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from 'user/user.entity';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private ideaToResponseObject(idea: IdeaEntity): IdeaRO {
    return {
      ...idea,
      author: idea.author ? idea.author.toResponseObject(false) : null,
    };
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    if (idea.author.id !== userId) {
      throw new HttpException('Incorrect User', HttpStatus.UNAUTHORIZED);
    }
  }

  public async readAll(): Promise<IdeaRO[]> {
    const ideas = await this.ideaRepository.find({ relations: ['author'] });
    return ideas.map(idea => this.ideaToResponseObject(idea));
  }

  public async readOne(id: string) {
    let idea;
    try {
      idea = await this.ideaRepository.findOne({
        where: { id },
        relations: ['author'],
      });
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return this.ideaToResponseObject(idea);
  }

  public async createOne(userId: string, data: IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = await this.ideaRepository.create({ ...data, author: user });

    await this.ideaRepository.save(idea);
    return this.ideaToResponseObject(idea);
  }

  public async updateOne(
    id: string,
    userId: string,
    data: Partial<IdeaDTO>,
  ): Promise<IdeaRO> {
    try {
      const idea = await this.ideaRepository.findOne({
        where: { id },
        relations: ['author'],
      });
      this.ensureOwnership(idea, userId);

      await this.ideaRepository.update({ id }, data);
      return this.ideaToResponseObject(idea);
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  public async destroyOne(id: string, userId: string): Promise<any> {
    try {
      const idea = await this.ideaRepository.findOne({
        where: { id },
        relations: ['author'],
      });
      this.ensureOwnership(idea, userId);
      await this.ideaRepository.remove(idea);
      return { deleted: true };
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}

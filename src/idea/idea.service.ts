import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO } from './idea.dto';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
  ) {}

  public async readAll() {
    return await this.ideaRepository.find();
  }

  public async readOne(id: string) {
    let idea;
    try {
      idea = await this.ideaRepository.findOne({ where: { id } });
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return idea;
  }

  public async createOne(data: IdeaDTO) {
    const idea = await this.ideaRepository.create(data);

    await this.ideaRepository.save(idea);
    return idea;
  }

  public async updateOne(id: string, data: Partial<IdeaDTO>) {
    try {
      await this.ideaRepository.update({ id }, data);
      return await this.ideaRepository.findOne({ where: { id } });
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  public async destroyOne(id: string) {
    try {
      await this.ideaRepository.delete({ id });
      return { deleted: true };
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}

import { Injectable } from '@nestjs/common';
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
    return await this.ideaRepository.findOne({ where: { id } });
  }

  public async createOne(data: IdeaDTO) {
    const idea = await this.ideaRepository.create(data);

    await this.ideaRepository.save(idea);
    return idea;
  }

  public async updateOne(id: string, data: Partial<IdeaDTO>) {
    await this.ideaRepository.update({ id }, data);
    return await this.ideaRepository.findOne({ id });
  }

  public async destroyOne(id: string) {
    await this.ideaRepository.delete({ id });
    return { deleted: true };
  }
}

import { Vote } from './vote.enum';
import { UserRO } from './../user/user.dto';
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
      upvotes: idea.upvotes ? idea.upvotes.length : undefined,
      downvotes: idea.downvotes ? idea.downvotes.length : undefined,
    };
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    if (idea.author.id !== userId) {
      throw new HttpException('Incorrect User', HttpStatus.UNAUTHORIZED);
    }
  }

  public async showAll(): Promise<IdeaRO[]> {
    const ideas = await this.ideaRepository.find({
      relations: ['author', 'upvotes', 'downvotes'],
    });
    return ideas.map(idea => this.ideaToResponseObject(idea));
  }

  public async read(id: string) {
    let idea;
    try {
      idea = await this.ideaRepository.findOne({
        where: { id },
        relations: ['author', 'upvotes', 'downvotes'],
      });
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return this.ideaToResponseObject(idea);
  }

  public async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = await this.ideaRepository.create({ ...data, author: user });

    await this.ideaRepository.save(idea);
    return this.ideaToResponseObject(idea);
  }

  public async update(
    id: string,
    userId: string,
    data: Partial<IdeaDTO>,
  ): Promise<IdeaRO> {
    try {
      const idea = await this.ideaRepository.findOne({
        where: { id },
        relations: ['author', 'upvotes', 'downvotes'],
      });
      this.ensureOwnership(idea, userId);

      await this.ideaRepository.update({ id }, data);
      return this.ideaToResponseObject(idea);
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  public async destroy(id: string, userId: string): Promise<any> {
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

  public async upvote(id: string, userId: string): Promise<IdeaRO> {
    try {
      let idea = await this.ideaRepository.findOne({
        where: { id },
        relations: ['author', 'upvotes', 'downvotes'],
      });
      const user = await this.userRepository.findOne({ where: { id: userId } });

      idea = await this.vote(idea, user, Vote.UP);

      return this.ideaToResponseObject(idea);
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  public async downvote(id: string, userId: string): Promise<IdeaRO> {
    try {
      let idea = await this.ideaRepository.findOne({
        where: { id },
        relations: ['author', 'upvotes', 'downvotes'],
      });
      const user = await this.userRepository.findOne({ where: { id: userId } });

      idea = await this.vote(idea, user, Vote.DOWN);

      return this.ideaToResponseObject(idea);
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  private async vote(idea: IdeaEntity, user: UserEntity, vote: Vote) {
    const opposite = vote === Vote.UP ? Vote.DOWN : Vote.UP;

    if (
      idea[opposite].filter(voter => voter.id === user.id).length > 0 ||
      idea[vote].filter(voter => voter.id === user.id).length > 0
    ) {
      idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
      idea[vote] = idea[vote].filter(voter => voter.id !== user.id);

      await this.ideaRepository.save(idea);
    } else if (idea[vote].filter(voter => voter.id === user.id).length < 1) {
      idea[vote].push(user);

      await this.ideaRepository.save(idea);
    } else {
      throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
    }
    return idea;
  }

  public async bookmark(id: string, userId: string): Promise<UserRO> {
    try {
      const idea = await this.ideaRepository.findOne({ where: { id } });
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['bookmarks'],
      });
      if (
        user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1
      ) {
        user.bookmarks.push(idea);
        await this.userRepository.save(user);
      } else {
        throw new HttpException(
          'Idea already bookmarked ',
          HttpStatus.BAD_REQUEST,
        );
      }
      return user.toResponseObject(false);
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  public async unbookmark(id: string, userId: string): Promise<UserRO> {
    try {
      const idea = await this.ideaRepository.findOne({ where: { id } });
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['bookmarks'],
      });
      if (
        user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0
      ) {
        user.bookmarks = user.bookmarks.filter(
          bookmark => bookmark.id !== idea.id,
        );
        await this.userRepository.save(user);
      } else {
        throw new HttpException(
          'Cannot remove bookmark',
          HttpStatus.BAD_REQUEST,
        );
      }
      return user.toResponseObject(false);
    } catch (error) {
      Logger.error(`${error.code}: ${error.message}`, undefined, 'IdeaService');
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}

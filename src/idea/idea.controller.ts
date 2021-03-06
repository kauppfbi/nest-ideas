import { ValidationPipe } from './../shared/validation.pipe';
import { IdeaDTO } from './idea.dto';
import { IdeaService } from './idea.service';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  Logger,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'shared/auth.guard';
import { User } from 'user/user.decorator';

@Controller('api/ideas')
export class IdeaController {
  private logger = new Logger('IdeaController');

  constructor(private ideaService: IdeaService) {}

  private logData(options: any) {
    options.user && this.logger.log('USER ' + JSON.stringify(options.user));
    options.body && this.logger.log('BODY ' + JSON.stringify(options.body));
    options.id && this.logger.log('IDEA ' + JSON.stringify(options.id));
  }

  @Get()
  public readAllIdeas(
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('sortby') sortBy: string,
    @Query('orderby') orderBy: string,
  ) {
    return this.ideaService.showAll(page, size, sortBy, orderBy);
  }

  @Get(':id')
  public readIdea(@Param('id') id: string) {
    this.logData({ id });
    return this.ideaService.read(id);
  }

  @Post()
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  public createIdea(@User('id') user, @Body() body: IdeaDTO) {
    this.logData({ user, body });
    return this.ideaService.create(user, body);
  }

  @Put(':id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  public updateIdea(
    @Param('id') id: string,
    @User('id') user,
    @Body() body: Partial<IdeaDTO>,
  ) {
    this.logData({ id, user, body });
    return this.ideaService.update(id, user, body);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  public deleteIdea(@Param('id') id: string, @User('id') user) {
    this.logData({ id, user });
    return this.ideaService.destroy(id, user);
  }

  @Post(':id/upvote')
  @UseGuards(new AuthGuard())
  upvoteIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.upvote(id, user);
  }

  @Post(':id/downvote')
  @UseGuards(new AuthGuard())
  downvoteIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.downvote(id, user);
  }

  @Post(':id/bookmark')
  @UseGuards(new AuthGuard())
  bookmarkIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.bookmark(id, user);
  }

  @Delete(':id/bookmark')
  @UseGuards(new AuthGuard())
  unbookmarkIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.unbookmark(id, user);
  }
}

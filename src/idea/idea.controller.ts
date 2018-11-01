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
  public readAllIdeas() {
    return this.ideaService.readAll();
  }

  @Get(':id')
  public readIdea(@Param('id') id: string) {
    this.logData({ id });
    return this.ideaService.readOne(id);
  }

  @Post()
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  public createIdea(@User('id') user, @Body() body: IdeaDTO) {
    this.logData({ user, body });
    return this.ideaService.createOne(body);
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
    return this.ideaService.updateOne(id, user, body);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  public deleteIdea(@Param('id') id: string, @User('id') user) {
    this.logData({ id, user });
    return this.ideaService.destroyOne(id, user);
  }
}

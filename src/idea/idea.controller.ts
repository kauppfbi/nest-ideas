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
} from '@nestjs/common';

@Controller('idea')
export class IdeaController {
  private logger = new Logger('IdeaController');
  constructor(private ideaService: IdeaService) {}

  @Get()
  public readAllIdeas() {
    return this.ideaService.readAll();
  }

  @Get(':id')
  public readIdea(@Param('id') id: string) {
    return this.ideaService.readOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  public createIdea(@Body() data: IdeaDTO) {
    this.logger.log(JSON.stringify(data));
    return this.ideaService.createOne(data);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  public updateIdea(@Param('id') id: string, @Body() data: Partial<IdeaDTO>) {
    this.logger.log(JSON.stringify(data));
    return this.ideaService.updateOne(id, data);
  }

  @Delete(':id')
  public deleteIdea(@Param('id') id: string) {
    return this.ideaService.destroyOne(id);
  }
}

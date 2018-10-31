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
} from '@nestjs/common';

@Controller('idea')
export class IdeaController {
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
  public createIdea(@Body() data: IdeaDTO) {
    return this.ideaService.createOne(data);
  }

  @Put(':id')
  public updateIdea(@Param('id') id: string, @Body() data: Partial<IdeaDTO>) {
    return this.ideaService.updateOne(id, data);
  }

  @Delete(':id')
  public deleteIdea(@Param('id') id: string) {
    return this.ideaService.destroyOne(id);
  }
}

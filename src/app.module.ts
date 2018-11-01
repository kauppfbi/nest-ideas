import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiModule } from './api.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [TypeOrmModule.forRoot(), ApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

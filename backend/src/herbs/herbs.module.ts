import { Module } from '@nestjs/common';
import { HerbsService } from './herbs.service';
import { HerbsController } from './herbs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HerbsController],
  providers: [HerbsService],
  exports: [HerbsService],
})
export class HerbsModule {}

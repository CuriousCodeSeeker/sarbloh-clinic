import { Module } from '@nestjs/common';
import { DiseaseCategoriesService } from './disease-categories.service';
import { DiseaseCategoriesController } from './disease-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DiseaseCategoriesController],
  providers: [DiseaseCategoriesService],
  exports: [DiseaseCategoriesService],
})
export class DiseaseCategoriesModule {}

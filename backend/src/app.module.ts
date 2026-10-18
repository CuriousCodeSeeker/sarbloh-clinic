import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { VisitsModule } from './visits/visits.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { MedicinesModule } from './medicines/medicines.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    PatientsModule,
    DashboardModule,
    VisitsModule,
    PrescriptionsModule,
    MedicinesModule,
    InventoryModule,
  ],
})
export class AppModule {}
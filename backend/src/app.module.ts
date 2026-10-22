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
import { SalesModule } from './sales/sales.module';
import { HerbsModule } from './herbs/herbs.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { DiseaseCategoriesModule } from './disease-categories/disease-categories.module';

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
    SalesModule,
    HerbsModule,
    AppointmentsModule,
    ReportsModule,
    SettingsModule,
    UsersModule,
    FilesModule,
    DiseaseCategoriesModule,
  ],
})
export class AppModule {}
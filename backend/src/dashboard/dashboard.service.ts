import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const [
      registeredPatients,
      visitsToday,
      visitsThisMonth,
      collectedThisMonth,
      medicinesToReorder,
      followUpsIn7Days,
      todaysAppointments,
      outstanding,
    ] = await Promise.all([
      // Registered patients
      this.prisma.patient.count({
        where: { isActive: true, deletedAt: null },
      }),

      // Visits today
      this.prisma.visit.count({
        where: { visitDate: { gte: startOfToday } },
      }),

      // Visits this month
      this.prisma.visit.count({
        where: { visitDate: { gte: startOfMonth } },
      }),

      // Collected this month (sum of payments)
      this.prisma.payment.aggregate({
        where: { paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),

      // Medicines to reorder (stock at or below reorder level)
      // Note: current stock is calculated from inventory transactions later.
      // For now we count medicines that have reorderLevel set (placeholder until inventory is live)
      this.prisma.medicine.count({
        where: { isActive: true, deletedAt: null },
      }).then(() => 0), // Will be real after inventory module

      // Follow-ups in next 7 days
      this.prisma.visit.count({
        where: {
          followUpDate: {
            gte: startOfToday,
            lte: in7Days,
          },
        },
      }),

      // Today's appointments
      this.prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: startOfToday,
            lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),

      // Outstanding amount
      this.prisma.sale.aggregate({
        where: {
          status: 'COMPLETED',
          paymentStatus: { in: ['PENDING', 'PARTIAL'] },
        },
        _sum: { dueAmount: true },
      }),
    ]);

    return {
      registeredPatients,
      visitsToday,
      visitsThisMonth,
      collectedThisMonth: Number(collectedThisMonth._sum.amount || 0),
      medicinesToReorder: 0, // Real value after inventory module
      followUpsIn7Days,
      todaysAppointments,
      outstanding: Number(outstanding._sum.dueAmount || 0),
    };
  }
}
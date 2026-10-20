import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_KEYS = [
  'clinic_name',
  'clinic_address',
  'clinic_phone',
  'clinic_email',
  'clinic_tagline',
] as const;

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const rows = await this.prisma.clinicSetting.findMany();
    const map: Record<string, string> = {};
    for (const key of DEFAULT_KEYS) {
      map[key] = '';
    }
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }

  async update(data: Record<string, string>) {
    const allowed = new Set<string>(DEFAULT_KEYS);

    for (const [key, value] of Object.entries(data)) {
      if (!allowed.has(key)) continue;

      await this.prisma.clinicSetting.upsert({
        where: { key },
        create: { key, value: value ?? '' },
        update: { value: value ?? '' },
      });
    }

    return this.getAll();
  }
}

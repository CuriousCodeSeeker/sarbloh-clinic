import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sarbloh.com' },
    update: {},
    create: {
      email: 'admin@sarbloh.com',
      passwordHash: adminPassword,
      fullName: 'Sarbloh Owner',
      role: UserRole.ADMIN,
      phone: '',
      isActive: true,
    },
  });
  console.log('Admin created:', admin.email);

  // Create Practitioner user
  const practPassword = await bcrypt.hash('Pract@123', 12);
  const practitioner = await prisma.user.upsert({
    where: { email: 'practitioner@sarbloh.com' },
    update: {},
    create: {
      email: 'practitioner@sarbloh.com',
      passwordHash: practPassword,
      fullName: 'Vaid Sukhwinder Singh',
      role: UserRole.PRACTITIONER,
      phone: '',
      isActive: true,
    },
  });
  console.log('Practitioner created:', practitioner.email);

  // Clinic Settings
  const settings = [
    { key: 'clinic_name', value: 'Sarbloh Ayurvedic Clinic' },
    { key: 'clinic_tagline', value: 'Sarbloh Ayurvedic CRM' },
    { key: 'practitioner_name', value: 'Vaid Sukhwinder Singh' },
    { key: 'clinic_address', value: '' },
    { key: 'clinic_phone', value: '' },
    { key: 'clinic_email', value: 'admin@sarbloh.com' },
    { key: 'currency', value: 'INR' },
    { key: 'currency_symbol', value: '₹' },
  ];

  for (const setting of settings) {
    await prisma.clinicSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('Clinic settings created');

  // Sample medicine categories
  const categories = [
    'Tablets',
    'Capsules',
    'Churna',
    'Syrup',
    'Oil',
    'Ghrita',
    'Vati',
    'Rasayana',
    'Herbal Powder',
    'Raw Herbs',
  ];

  for (const name of categories) {
    await prisma.medicineCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Medicine categories created');

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

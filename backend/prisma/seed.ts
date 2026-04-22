import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@agency.io';
  const adminPwd = 'Admin123!';

  const password = await bcrypt.hash(adminPwd, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password,
      firstName: 'Admin',
      lastName: 'Root',
      role: Role.ADMIN,
    },
  });

  const sample = [
    {
      title: 'Marrakech Discovery',
      description: '5-day cultural tour through the souks and palaces of Marrakech.',
      destination: 'Marrakech, Morocco',
      price: 549.0,
      startDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-15'),
      capacity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1539020140153-e479b8c5e0a9?w=1200',
    },
    {
      title: 'Santorini Sunsets',
      description: 'A 7-day romantic escape to the white cliffs of Santorini.',
      destination: 'Santorini, Greece',
      price: 1290.0,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-08'),
      capacity: 12,
      imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200',
    },
    {
      title: 'Tokyo in Bloom',
      description: '10-day tour of Tokyo and Kyoto during cherry-blossom season.',
      destination: 'Tokyo, Japan',
      price: 2390.0,
      startDate: new Date('2027-03-25'),
      endDate: new Date('2027-04-04'),
      capacity: 16,
      imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200',
    },
  ];

  for (const t of sample) {
    const exists = await prisma.travel.findFirst({ where: { title: t.title } });
    if (!exists) await prisma.travel.create({ data: t });
  }

  console.log(`Seed complete. Admin: ${adminEmail} / ${adminPwd}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

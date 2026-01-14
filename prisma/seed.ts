import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create initial location
  const location = await prisma.location.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Main Mosque Parking',
      address: '123 Mosque Street, City, State 12345',
      latitude: null,
      longitude: null,
    },
  });

  console.log('Created location:', location.name);

  // Create zones
  const zoneA = await prisma.zone.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      locationId: location.id,
      name: 'Zone A',
      description: 'Near main entrance, left side of building',
      totalSpots: 50,
      occupiedSpots: 0,
    },
  });

  const zoneB = await prisma.zone.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      locationId: location.id,
      name: 'Zone B',
      description: 'Back parking area, near side entrance',
      totalSpots: 40,
      occupiedSpots: 0,
    },
  });

  const zoneC = await prisma.zone.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      locationId: location.id,
      name: 'Zone C',
      description: 'Right side parking, accessible spaces available',
      totalSpots: 30,
      occupiedSpots: 0,
    },
  });

  console.log('Created zones:', [zoneA.name, zoneB.name, zoneC.name]);

  // Create admin user (password: admin123)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      username: 'admin',
      passwordHash: hashedPassword,
      locationId: location.id,
    },
  });

  console.log('Created admin user:', admin.username);
  console.log('Default password: admin123');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


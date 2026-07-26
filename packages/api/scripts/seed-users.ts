import { createConnection } from 'typeorm';
import { User } from '../src/auth/user.entity';
import * as bcrypt from 'bcrypt';

const testUsers = [
  {
    name: 'test1',
    email: 'test1@example.com',
    password: 'tester',
    role: 'user' as const,
    credits: 3,
  },
  {
    name: 'test2',
    email: 'test2@example.com',
    password: 'tester',
    role: 'vip' as const,
    credits: 10,
  },
  {
    name: 'test3',
    email: 'test3@example.com',
    password: 'tester',
    role: 'vip' as const,
    credits: 20,
  },
];

async function seedUsers() {
  const connection = await createConnection({
    type: 'sqlite',
    database: 'accessaudit.db',
    entities: [User],
    synchronize: true,
  });

  const userRepository = connection.getRepository(User);

  for (const userData of testUsers) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`User ${userData.email} already exists, skipping...`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = userRepository.create({
      ...userData,
      password: hashedPassword,
      provider: 'email',
      verified: true,
    });

    await userRepository.save(user);
    console.log(`Created user: ${userData.name} (${userData.role})`);
  }

  await connection.close();
  console.log('Seed completed successfully!');
}

seedUsers().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

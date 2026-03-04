import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmin() {
    console.log('Seeding admin user...');

    const email = 'admin@antigravity.dev';
    const rawPassword = 'AdminPassword123!';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({
        where: { email }
    });

    if (existing) {
        console.log('Admin user already exists!');
        // Update role just in case
        await prisma.user.update({
            where: { email },
            data: { role: 'admin' }
        });
        console.log('Role ensured as admin.');
    } else {
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: 'admin',
                isVerified: true,
                profile: {
                    create: {
                        username: 'Admin',
                        fullName: 'System Administrator',
                        profileVisibility: 'PUBLIC'
                    }
                },
                gamification: { create: {} },
                notificationSettings: { create: {} }
            }
        });
        console.log('✅ Admin user created successfully:');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${rawPassword}`);
    }

    // Secondary Admin
    const email2 = 'admin@codekori.com';
    const existing2 = await prisma.user.findUnique({ where: { email: email2 } });

    if (existing2) {
        console.log('Admin user 2 already exists!');
        await prisma.user.update({
            where: { email: email2 },
            data: { role: 'admin' }
        });
        console.log('Role ensured as admin.');
    } else {
        const passwordHash = await bcrypt.hash(rawPassword, 10);
        await prisma.user.create({
            data: {
                email: email2,
                passwordHash,
                role: 'admin',
                isVerified: true,
                profile: {
                    create: {
                        username: 'CodekoriAdmin',
                        fullName: 'Codekori Administrator',
                        profileVisibility: 'PUBLIC'
                    }
                },
                gamification: { create: {} },
                notificationSettings: { create: {} }
            }
        });
        console.log('✅ Admin user 2 created successfully:');
        console.log(`Email:    ${email2}`);
        console.log(`Password: ${rawPassword}`);
    }
}

seedAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

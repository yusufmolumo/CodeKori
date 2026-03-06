import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Publish all courses
    const courses = await prisma.course.updateMany({
        data: { isPublished: true }
    });
    console.log(`✅ Published ${courses.count} courses`);

    // Publish all challenges
    const challenges = await prisma.codingChallenge.updateMany({
        data: { isPublished: true }
    });
    console.log(`✅ Published ${challenges.count} challenges`);

    // Create forum categories if none exist
    const catCount = await prisma.forumCategory.count();
    if (catCount === 0) {
        await prisma.forumCategory.createMany({
            data: [
                { name: 'General', description: 'General discussions' },
                { name: 'Help', description: 'Ask for help' },
                { name: 'Show & Tell', description: 'Share your projects' },
                { name: 'Resources', description: 'Useful learning resources' },
            ]
        });
        console.log('✅ Created 4 forum categories');
    } else {
        console.log(`ℹ️  ${catCount} forum categories already exist`);
    }

    console.log('\n🎉 Done! All content is now visible to learners.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());

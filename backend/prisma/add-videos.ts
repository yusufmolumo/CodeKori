import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map lesson topics to relevant YouTube embed URLs (free educational content)
const videoMap: Record<string, string> = {
    'Introduction to HTML': 'https://www.youtube.com/embed/qz0aGYrrlhU',
    'Hyperlinks': 'https://www.youtube.com/embed/DiSvq5SgLMI',
    'Images': 'https://www.youtube.com/embed/Zy4KN3VE1jk',
    'Audio & Video': 'https://www.youtube.com/embed/OOy764eSC5Y',
    'Text Formatting': 'https://www.youtube.com/embed/gT0Lh1eYk78',
    'HTML Lists': 'https://www.youtube.com/embed/HeP0fQ1FBmI',
    'HTML Tables': 'https://www.youtube.com/embed/iDA0kF5lrVk',
    'HTML Colors': 'https://www.youtube.com/embed/HxztHgRN8I4',
    'HTML Span & Div': 'https://www.youtube.com/embed/eJe5nh1b7cg',
    'HTML Review Project': 'https://www.youtube.com/embed/pQN-pnXPaVg',
    'Introduction to CSS': 'https://www.youtube.com/embed/1PnVor36_40',
    'CSS Fonts': 'https://www.youtube.com/embed/LpcWfqXviB0',
    'CSS Borders': 'https://www.youtube.com/embed/sdn5p4kf91c',
    'CSS Background': 'https://www.youtube.com/embed/Tfjd5yzCaxk',
    'CSS Margins & Padding': 'https://www.youtube.com/embed/EhbZGV2dqZ4',
    'CSS Float': 'https://www.youtube.com/embed/VwxGKpvW8Zk',
    'CSS Position': 'https://www.youtube.com/embed/jx5jmI0UlXU',
    'CSS Pseudo Classes': 'https://www.youtube.com/embed/0VDx1570X3U',
    'CSS Pseudo Elements': 'https://www.youtube.com/embed/zGiAbGkhNqs',
    'CSS Shadows': 'https://www.youtube.com/embed/Yon4l3MUBGY',
};

async function addVideos() {
    console.log('Adding video URLs to lessons...\n');

    for (const [title, videoUrl] of Object.entries(videoMap)) {
        const result = await prisma.lesson.updateMany({
            where: { title },
            data: { videoUrl }
        });
        console.log(`  ✅ ${title}: updated ${result.count} lesson(s)`);
    }

    console.log('\nDone! All lessons now have video URLs.');
    await prisma.$disconnect();
}

addVideos().catch(console.error);

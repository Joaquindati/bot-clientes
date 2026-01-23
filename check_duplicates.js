
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for duplicate users...');

    const users = await prisma.user.findMany();
    console.log(`Total users: ${users.length}`);

    const emailMap = {};
    const duplicates = [];

    for (const user of users) {
        const email = user.email.toLowerCase(); // Check case-insensitive
        if (emailMap[email]) {
            duplicates.push({ original: emailMap[email], duplicate: user });
        } else {
            emailMap[email] = user;
        }
    }

    if (duplicates.length > 0) {
        console.log('⚠️ Duplicates found:', duplicates.length);
        duplicates.forEach(d => {
            console.log(`- Duplicate: ${d.duplicate.email} (ID: ${d.duplicate.id}) matches ${d.original.email} (ID: ${d.original.id})`);
        });
    } else {
        console.log('✅ No duplicates found (case-insensitive check).');
    }

    // Also check raw DB counts if possible just to be sure prisma isn't filtering weirdly
    // (Prisma findMany returns all)
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

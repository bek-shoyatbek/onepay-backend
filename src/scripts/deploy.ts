import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deploy() {
    try {
        console.log('Generating Prisma Client...');
        await execAsync('npx prisma generate');
        console.log('✓ Prisma Client generated');

        console.log('Running database migrations...');
        await execAsync('npx prisma migrate deploy');
        console.log('✓ Migrations completed');

        console.log('Starting application...');
        await execAsync('npm run start:prod');
    } catch (error) {
        console.error('Deployment failed:', error);
        process.exit(1);
    }
}

deploy();
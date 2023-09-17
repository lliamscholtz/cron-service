import { Elysia } from 'elysia';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface RegisterRequest {
    email: string;
    password: string;
}

interface Cron {
    id: string;
    schedule: string;
    method: string;
    url: string;
    auth: string | null;
    key: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface DeployRequest {
    key: string;
    crons: Cron[];
}

interface Response {
    success: boolean;
    message?: string;
    key?: string;
    crons?: Cron[];
}

const printRequestInfo = (url: string): void => {
    console.log(new Date().toISOString() + ' - POST ' + url);
};

const hashPassword = async (password: string): Promise<string> => {
    return await Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 4,
    });
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await Bun.password.verify(password, hash);
};

const app = new Elysia()
    .post('/register', async ({ body }): Promise<Response> => {
        const { email, password } = body as RegisterRequest;

        printRequestInfo('/register');

        const user = await prisma.user.create({
            data: {
                email,
                password: await hashPassword(password),
            },
        });

        return {
            success: true,
            key: user.id,
        };
    })
    .post('/configure', async ({ body }): Promise<Response> => {
        const { email, password } = body as RegisterRequest;

        printRequestInfo('/configure');

        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        const passwordMatch = await verifyPassword(password, user?.password ?? '');

        if (!user?.id || !passwordMatch) {
            return {
                success: false,
                message: 'Invalid user credentials.',
            };
        }

        return {
            success: true,
            key: user.id,
        };
    })
    .post('/deploy', async ({ body }): Promise<Response> => {
        const { key, crons } = body as DeployRequest;

        await prisma.cron.deleteMany({
            where: {
                key: {
                    contains: key,
                },
            },
        });

        await prisma.cron.createMany({
            data: crons.map((cron) => ({
                key,
                schedule: cron.schedule,
                method: cron.method,
                url: cron.url,
                auth: cron.auth,
            })),
        });

        const allCrons = await prisma.cron.findMany({
            where: {
                key: {
                    contains: key,
                },
            },
        });

        printRequestInfo('/deploy');
        return {
            success: true,
            message: 'Deployed successfully.',
            crons: allCrons,
        };
    })
    .post('/check', async ({ body }): Promise<Response> => {
        const { key } = body as DeployRequest;

        const allCrons = await prisma.cron.findMany({
            where: {
                key: {
                    contains: key,
                },
            },
        });

        printRequestInfo('/check');
        return {
            success: true,
            message: 'Checked successfully.',
            crons: allCrons,
        };
    })
    .listen(8080);

console.log(
    `🦊 cronx server is running at ${app.server?.hostname}:${app.server?.port}`
);

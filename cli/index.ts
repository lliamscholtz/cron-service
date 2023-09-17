import * as p from '@clack/prompts';
import color from 'picocolors';

// Annotations
interface Action {
    type: 'register' | 'configure' | 'deploy' | 'check';
}

interface Cron {
    id: string;
    name: string;
    schedule: string;
    method: string;
    url: string;
    auth: string | null;
    key: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Libraries
import makeUserApiCall from './lib/makeUserApiCall';
import writeConfigFile from './lib/writeConfigFile';
import upgateGitIgnore from './lib/upgateGitIgnore';
import makeCronApiCalls from './lib/makeCronApiCalls';

// Configuration
const configFileName = 'cronx.config.json';
const apiEndpoint = 'http://127.0.0.1:8080';

const onComplete = `
${configFileName} created
${configFileName} added to .gitignore
`;

// **********************
// REGISTER
// **********************
async function register() {
    const register = await p.group(
        {
            email: () =>
                p.text({
                    message: 'Please enter your email address',
                }),
            password: () =>
                p.password({
                    message: 'Provide a password',
                    validate: (value) => {
                        if (!value) return 'Please enter a password.';
                        if (value.length < 5)
                            return 'Password should have at least 5 characters.';
                    },
                }),
            verify: ({ results }) =>
                p.password({
                    message: 'Enter the password again',
                    validate: (value) => {
                        if (!value) return 'Please enter a password.';
                        if (value.length < 5)
                            return 'Password should have at least 5 characters.';
                        if (value !== results.password)
                            return 'Passwords do not match.';
                    },
                }),
            configure: () =>
                p.confirm({
                    message:
                        'Do you want to configure cron-service after registration?',
                    initialValue: false,
                }),
        },
        {
            onCancel: () => {
                p.cancel('Operation cancelled.');
                process.exit(0);
            },
        }
    );

    const s = p.spinner();
    s.start('Registering account...');

    const { success, message, key } = await makeUserApiCall(
        apiEndpoint + '/register',
        register.email,
        register.password
    );

    s.stop('Registration complete');

    if (!success) {
        p.cancel(message);
        process.exit(0);
    }

    p.note('Account registered', '📝 Registration.');

    if (key && register.configure) {
        await writeConfigFile(configFileName, key);
        await upgateGitIgnore(configFileName);

        p.note(onComplete, '🛠️  Configuration.');
    }
}

// **********************
// CONFIGURE
// **********************
async function config() {
    const config = await p.group(
        {
            email: () =>
                p.text({
                    message: 'Please enter your email address',
                }),
            password: () =>
                p.password({
                    message: 'Provide a password',
                    validate: (value) => {
                        if (!value) return 'Please enter a password.';
                        if (value.length < 5)
                            return 'Password should have at least 5 characters.';
                    },
                }),

            install: () =>
                p.confirm({
                    message: 'Configure cron-service now?',
                    initialValue: false,
                }),
        },
        {
            onCancel: () => {
                p.cancel('Operation cancelled.');
                process.exit(0);
            },
        }
    );

    if (config.install) {
        const s = p.spinner();
        s.start('Checking credentials...');

        const { success, message, key } = await makeUserApiCall(
            apiEndpoint + '/configure',
            config.email,
            config.password
        );

        s.stop('Credentials checked');

        if (!success) {
            p.cancel(message);
            process.exit(0);
        }

        await writeConfigFile(configFileName, key);
        await upgateGitIgnore(configFileName);

        p.note(onComplete, '🛠️  Configuration.');
    }
}

// **********************
// DEPLOY
// **********************
async function deploy() {
    const s = p.spinner();
    s.start('Deploying cron jobs...');

    const { success, crons } = await makeCronApiCalls(
        apiEndpoint + '/deploy',
        configFileName
    );
    s.stop('Deployment complete');

    if (!success) {
        p.cancel('Unable to deploy cron jobs.');
        process.exit(0);
    }

    function formatCrons(crons: Cron[]) {
        return crons
            .map(
                (cron) => '🟠 ' + cron.schedule + ' ' + cron.method + ' ' + cron.url
            )
            .join('\n');
    }

    p.note(formatCrons(crons), '🚀 Deployment.');
}

// **********************
// Check
// **********************
async function check() {
    const s = p.spinner();
    s.start('Checking cron jobs...');

    const { success, crons } = await makeCronApiCalls(
        apiEndpoint + '/check',
        configFileName
    );
    s.stop('Check complete');

    if (!success) {
        p.cancel('Unable to check cron jobs.');
        process.exit(0);
    }

    function formatCrons(crons: Cron[]) {
        return crons
            .map(
                (cron) =>
                    (cron.active ? '🟢 ' : '🔴 ') +
                    cron.schedule +
                    ' ' +
                    cron.method +
                    ' ' +
                    cron.url
            )
            .join('\n');
    }

    p.note(formatCrons(crons), '🚀 Deployment.');
}

// **********************
// MAIN
// **********************
async function main() {
    console.clear();
    console.log(import.meta.dir);

    p.intro(`${color.bgCyan(color.black(' cronx '))}`);

    const action = (await p.group(
        {
            type: () =>
                p.select({
                    message: `What would you like to do?`,
                    initialValue: 'register',
                    maxItems: 4,
                    options: [
                        { value: 'register', label: 'Register an account' },
                        { value: 'configure', label: 'Configure my project' },
                        { value: 'deploy', label: 'Deploy my cron jobs' },
                        { value: 'check', label: 'Check cron jobs status' },
                    ],
                }),
        },
        {
            onCancel: () => {
                p.cancel('Operation cancelled.');
                process.exit(0);
            },
        }
    )) as Action;

    switch (action.type) {
        case 'register':
            await register();
            break;
        case 'configure':
            await config();
            break;
        case 'deploy':
            await deploy();
            break;
        case 'check':
            await check();
            break;
    }

    p.outro(
        `Problems? ${color.underline(
            color.cyan('https://github.com/lliamscholtz/cronx/issues')
        )}`
    );
}

main().catch(console.error);

import * as p from '@clack/prompts';
import color from 'picocolors';

// Annotations
interface Action {
    type: 'register' | 'configure' | 'deploy';
}

// Libraries
import fetchApiKey from './lib/fetchApiKey';
import writeConfigFile from './lib/writeConfigFile';
import upgateGitIgnore from './lib/upgateGitIgnore';

// Configuration
const configFileName = 'crons.config.json';
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

    p.note('Account registered', '📝 Registration.');

    // TODO: Register the user

    if (register.configure) {
        const apiKey = await fetchApiKey(register.email, register.password);
        await writeConfigFile(configFileName, apiKey);
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
        const apiKey = await fetchApiKey(config.email, config.password);
        await writeConfigFile(configFileName, apiKey);
        await upgateGitIgnore(configFileName);

        p.note(onComplete, '🛠️  Configuration.');
    }
}

// **********************
// DEPLOY
// **********************
async function deploy() {
    p.note('Cron jobs deployed.', '🚀 Deployment.');
}

// **********************
// MAIN
// **********************
async function main() {
    console.clear();

    p.intro(`${color.bgCyan(color.black(' cron-service '))}`);

    const action = (await p.group(
        {
            type: () =>
                p.select({
                    message: `What would you like to do?`,
                    initialValue: 'register',
                    maxItems: 3,
                    options: [
                        { value: 'register', label: 'Register an account' },
                        { value: 'configure', label: 'Configure my project' },
                        { value: 'deploy', label: 'Deploy my cron jobs' },
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
    }

    p.outro(
        `Problems? ${color.underline(
            color.cyan('https://github.com/lliamscholtz/cron-service/issues')
        )}`
    );
}

main().catch(console.error);

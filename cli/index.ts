import * as p from '@clack/prompts';
import color from 'picocolors';

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

async function main() {
    console.clear();

    p.intro(`${color.bgCyan(color.black(' cron-service '))}`);

    const project = await p.group(
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

    if (project.install) {
        const apiKey = await fetchApiKey(project.email, project.password);
        await writeConfigFile(configFileName, apiKey);
        await upgateGitIgnore(configFileName);

        p.note(onComplete, 'Done.');
    }

    p.outro(
        `Problems? ${color.underline(
            color.cyan('https://github.com/lliamscholtz/cron-service/issues')
        )}`
    );
}

main().catch(console.error);

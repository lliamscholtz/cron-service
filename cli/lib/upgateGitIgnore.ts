export default async function upgateGitIgnore(configFileName: string) {
    const gitignore = Bun.file('.gitignore');
    const fileExists = await gitignore.exists();

    if (fileExists) {
        const ignored = await gitignore.text();
        if (!ignored.includes(configFileName)) {
            Bun.write('.gitignore', ignored + `\n${configFileName}`);
        }
    } else {
        Bun.write('.gitignore', configFileName);
    }

    return;
}

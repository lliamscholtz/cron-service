export default async function upgateGitIgnore(configFileName: string) {
    const gitignore = Bun.file('.gitignore');
    const ignored = await gitignore.text();

    if (!ignored.includes(configFileName)) {
        Bun.write('.gitignore', ignored + `\n${configFileName}`);
        return;
    }
}

export default async function makeCronApiCalls(
    endpoint: string,
    configFileName: string
) {
    const file = Bun.file(configFileName);
    const contents = await file.json();

    const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(contents),
        headers: { 'Content-Type': 'application/json' },
    });

    return await response.json();
}

export default async function writeConfigFile(
    configFileName: string,
    password: string
) {
    const configFile = `{
    "key": "${password}",
    "crons": [
        {
            "schedule": "0 0 * * *", 
            "method": "GET",
            "url": "https://example.com",
            "auth": "dXNlcm5hbWU6cGFzc3dvcmQ="
        }
    ]
}`;
    Bun.write(configFileName, configFile);
}

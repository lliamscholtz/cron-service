export default async function makeUserApiCall(
    endpoint: string,
    email: string,
    password: string
) {
    const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
    });

    return await response.json();
}

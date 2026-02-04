import { NextResponse } from 'next/server';

export async function GET(request) {
    // Note: The user's original curl shows sending the refreshToken as a header in a GET request.
    // We will extract it from the incoming request headers or query params.
    // Since the frontend will send it in headers, we'll read it from there.

    const refreshToken = request.headers.get('refreshToken');

    if (!refreshToken) {
        return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    try {
        const response = await fetch('https://beds24.com/api/v2/authentication/token', {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'refreshToken': refreshToken
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Beds24 Token Error:', errorText);
            return NextResponse.json({ error: 'Failed to authenticate with Beds24' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Beds24 Token Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

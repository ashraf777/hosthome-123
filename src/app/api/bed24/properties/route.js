import { NextResponse } from 'next/server';

export async function GET(request) {
    const token = request.headers.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Access token is required' }, { status: 401 });
    }

    try {
        const response = await fetch('https://beds24.com/api/v2/properties?includeAllRooms=true', {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'token': token
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Beds24 Properties Error:', errorText);
            return NextResponse.json({ error: 'Failed to fetch properties from Beds24' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Beds24 Properties Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const token = request.headers.get('token');

    if (!startDate || !endDate) {
        return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 401 });
    }

    try {
        const response = await fetch(`https://beds24.com/api/v2/inventory/rooms/calendar?startDate=${startDate}&endDate=${endDate}&includePrices=true&includeLinkedPrices=true`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'token': token
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.error || "Failed to fetch calendar from Beds24" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Beds24 Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request) {
    const token = request.headers.get('token');
    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Bed24 requires an array of updates
        // body should be: [{ roomId: ..., calendar: [...] }]

        const response = await fetch(`https://beds24.com/api/v2/inventory/rooms/calendar`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'token': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Beds24 POST Error:", errorData);
            return NextResponse.json({ error: errorData.error || "Failed to update calendar" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Beds24 Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

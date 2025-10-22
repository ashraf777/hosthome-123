
const BASE_URL = 'https://hosthomestaging.frenclub.com/api';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}/${endpoint}`;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const status = response.status;
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        
        // IMPORTANT: Throwing an object with 'status' and 'message'
        throw { 
            message: errorData.message || `HTTP error! status: ${status}`,
            status: status
        };
}
    
    // For endpoints that might not return a body (e.g., logout, delete)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return { message: "Operation successful" };
    }
}

export const api = {
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

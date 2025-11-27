
const BASE_URL = 'https://hosthomestaging.frenclub.com/api';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}/${endpoint}`;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    // console.log(`API Request token: token=${token} to ${url} with options:`, options);
    
    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };
    
    // Do not set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }


    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        // Handle validation errors from Laravel
        if (response.status === 422 && errorData.errors) {
            const firstError = Object.values(errorData.errors)[0][0];
            throw new Error(firstError || errorData.message);
        }
        // Handle custom error messages from the backend under the "error" key
        if (errorData.error) {
            throw new Error(errorData.error);
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
    post: (endpoint, body) => {
        const isFormData = body instanceof FormData;
        const config = {
            method: 'POST',
            body: isFormData ? body : (body ? JSON.stringify(body) : null)
        };
        // If there's no body, we should not send the Content-Type header.
        if (!body || isFormData) {
             return request(endpoint, { method: 'POST', body: isFormData ? body : undefined });
        }
        return request(endpoint, { 
            method: 'POST', 
            body: JSON.stringify(body)
        });
    },
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

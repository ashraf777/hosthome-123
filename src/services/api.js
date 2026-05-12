
const BASE_URL = 'https://hosthomestaging.frenclub.com/api';
// const BASE_URL = 'http://localhost:8001/api';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}/${endpoint}`;

    let token = null;
    if (typeof window !== 'undefined') {
        try {
            token = window.localStorage && typeof window.localStorage.getItem === 'function'
                ? window.localStorage.getItem('access_token')
                : null;
        } catch (e) {
            token = null;
        }
    }

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
        if (response.status === 401) {
            // Handle Unauthorized globally
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
            throw new Error('Session expired. Please log in again.');
        }

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
        if (!body || isFormData) {
            return request(endpoint, { method: 'POST', body: isFormData ? body : undefined });
        }
        return request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },
    get: (endpoint, options = {}) => {
        let url = endpoint;
        if (options.params) {
            const queryParams = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value);
                }
            });
            const queryString = queryParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        return request(url, { method: 'GET', ...options });
    },
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

    // Cleaning Teams
    getCleaningTeams: () => request('cleaning-teams'),
    createCleaningTeam: (teamData) => request('cleaning-teams', { method: 'POST', body: JSON.stringify(teamData) }),
    getCleaningTeam: (teamId) => request(`cleaning-teams/${teamId}`),
    updateCleaningTeam: (teamId, teamData) => request(`cleaning-teams/${teamId}`, { method: 'PUT', body: JSON.stringify(teamData) }),
    deleteCleaningTeam: (teamId) => request(`cleaning-teams/${teamId}`, { method: 'DELETE' }),
    syncTeamMembers: (teamId, memberIds) => request(`cleaning-teams/${teamId}/sync-members`, { method: 'POST', body: JSON.stringify({ members: memberIds }) }),

    // Checklists
    getChecklists: () => request('checklists'),
    createChecklist: (checklistData) => request('checklists', { method: 'POST', body: JSON.stringify(checklistData) }),
    getChecklist: (checklistId) => request(`checklists/${checklistId}`),
    updateChecklist: (checklistId, checklistData) => request(`checklists/${checklistId}`, { method: 'PUT', body: JSON.stringify(checklistData) }),
    deleteChecklist: (checklistId) => request(`checklists/${checklistId}`, { method: 'DELETE' }),
    addChecklistItem: (checklistId, itemData) => request(`checklists/${checklistId}/items`, { method: 'POST', body: JSON.stringify(itemData) }),
    updateChecklistItem: (checklistId, itemId, itemData) => request(`checklists/${checklistId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(itemData) }),
    deleteChecklistItem: (checklistId, itemId) => request(`checklists/${checklistId}/items/${itemId}`, { method: 'DELETE' }),

    // Guest Messaging & Templates
    getMessageTemplates: () => request('message-templates'),
    createMessageTemplate: (data) => request('message-templates', { method: 'POST', body: JSON.stringify(data) }),
    updateMessageTemplate: (id, data) => request(`message-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMessageTemplate: (id) => request(`message-templates/${id}`, { method: 'DELETE' }),
    runMessageAutomations: () => request('message-templates/run-automations', { method: 'POST' }),

    getInboxMessages: (page = 1) => request(`messages?page=${page}`),
    getBookingThread: (bookingId) => request(`messages/${bookingId}/thread`),
    sendMessage: (bookingId, data) => request(`messages/${bookingId}/send`, { method: 'POST', body: JSON.stringify(data) }),

    // Magic Link Guest Portal (Public)
    getGuestPortalSummary: (token) => request(`guest-portal/${token}`),
    getGuestPortalMessages: (token) => request(`guest-portal/${token}/messages`),
    sendGuestPortalMessage: (token, data) => request(`guest-portal/${token}/messages`, { method: 'POST', body: JSON.stringify(data) }),
};

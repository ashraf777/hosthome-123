
const BASE_URL = 'https://hosthomestaging.frenclub.com/api';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}/${endpoint}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

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
};

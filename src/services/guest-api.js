
import { api } from './api';
import { MOCK_PROPERTIES, MOCK_ROOM_TYPES } from '@/lib/mock-data';

/**
 * Guest-facing API service with mock fallbacks.
 */
export const guestApi = {
    /**
     * Fetch all properties. Fallback to MOCK_PROPERTIES if API fails or returns empty.
     */
    getProperties: async () => {
        try {
            const response = await api.get('properties');
            const data = response?.data || response;
            if (Array.isArray(data) && data.length > 0) {
                return data.map(property => ({
                    ...property,
                    room_types: property.room_types || MOCK_ROOM_TYPES[property.id] || []
                }));
            }
            console.warn('API returned empty/invalid properties, falling back to mock data.');
            return MOCK_PROPERTIES.map(property => ({
                ...property,
                room_types: MOCK_ROOM_TYPES[property.id] || []
            }));
        } catch (error) {
            console.error('Failed to fetch properties from API, falling back to mock data:', error);
            return MOCK_PROPERTIES.map(property => ({
                ...property,
                room_types: MOCK_ROOM_TYPES[property.id] || []
            }));
        }
    },

    /**
     * Fetch property details and its room types.
     */
    getPropertyDetails: async (id) => {
        try {
            // Try fetching specific property
            const propResponse = await api.get(`properties/${id}`);
            const property = propResponse?.data || propResponse;

            // Try fetching room types for this property
            const rtResponse = await api.get(`properties/${id}/room-types`);
            const roomTypes = rtResponse?.data || rtResponse || [];

            if (property && property.id) {
                return {
                    ...property,
                    room_types: (Array.isArray(roomTypes) && roomTypes.length > 0)
                        ? roomTypes
                        : (property.room_types || MOCK_ROOM_TYPES[id] || [])
                };
            }

            throw new Error('Property not found');
        } catch (error) {
            console.error(`Failed to fetch property ${id} from API, falling back to mock data:`, error);
            const mockProp = MOCK_PROPERTIES.find(p => p.id === id);
            if (mockProp) {
                return {
                    ...mockProp,
                    room_types: MOCK_ROOM_TYPES[id] || []
                };
            }
            return null;
        }
    }
};

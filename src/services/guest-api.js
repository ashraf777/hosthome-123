
import { api } from './api';

/**
 * Helper to ensure image URLs are fully qualified.
 */
const formatImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://hosthomestaging.frenclub.com/storage/${path}`;
};

const formatPhotos = (photos) => {
    if (!Array.isArray(photos)) return [];
    return photos.map(p => ({ ...p, photo_path: formatImageUrl(p.photo_path) }));
};

const formatPropertyData = (property) => ({
    ...property,
    photos: formatPhotos(property.photos),
    room_types: Array.isArray(property.room_types) ? property.room_types.map(rt => ({
        ...rt,
        photos: formatPhotos(rt.photos),
        units: Array.isArray(rt.units) ? rt.units.map(u => ({
            ...u,
            photos: formatPhotos(u.photos)
        })) : []
    })) : []
});

/**
 * Guest-facing API service with mock fallbacks.
 */
export const guestApi = {
    /**
     * Fetch all properties. Fallback to MOCK_PROPERTIES if API fails or returns empty.
     */
    getProperties: async (params = {}) => {
        try {
            const response = await api.get('guest/properties', { params });
            const data = response?.data?.data || response?.data || response; // Handle pagination wrapper if present
            if (Array.isArray(data)) {
                return data.map(formatPropertyData);
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch properties from API:', error);
            return [];
        }
    },

    /**
     * Fetch property details and its room types.
     */
    getPropertyDetails: async (id) => {
        try {
            // The guest API show endpoint now includes room_types and amenities
            const propResponse = await api.get(`guest/properties/${id}`);
            const property = propResponse?.data || propResponse;

            const roomTypes = property.room_types || [];

            if (property && property.id) {
                return formatPropertyData(property);
            }

            throw new Error('Property not found');
        } catch (error) {
            console.error(`Failed to fetch property ${id} from API:`, error);
            return null;
        }
    },

    // Check availability for specific dates
    checkAvailability: async (params) => {
        const query = new URLSearchParams(params).toString();
        // The custom API client automatically throws if !response.ok and parses JSON
        return await api.get(`guest/availability/check?${query}`);
    },

    /**
     * Store a new booking
     */
    createBooking: async (bookingData) => {
        try {
            const response = await api.post('guest/bookings', bookingData);
            return response?.data || response;
        } catch (error) {
            console.error('Failed to create booking:', error);
            throw new Error(error.response?.data?.message || 'Failed to complete booking. Please try again.');
        }
    }
};

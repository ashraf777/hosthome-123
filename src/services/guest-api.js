
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
     * Fetch all properties for a specific hosting company.
     */
    getProperties: async (slug, params = {}) => {
        if (!slug || slug === 'undefined') {
            console.error('guestApi.getProperties: Missing slug');
            return [];
        }
        try {
            const response = await api.get(`guest/${slug}/properties`, { params });
            const data = response?.data?.data || response?.data || response; 
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
    getPropertyDetails: async (slug, id) => {
        try {
            const propResponse = await api.get(`guest/${slug}/properties/${id}`);
            const property = propResponse?.data || propResponse;

            if (property && property.id) {
                return formatPropertyData(property);
            }

            throw new Error('Property not found');
        } catch (error) {
            console.error(`Failed to fetch property ${id} from API:`, error);
            return null;
        }
    },

    /**
     * Fetch amenities for a specific hosting company.
     */
    getAmenities: async (slug) => {
        try {
            const response = await api.get(`guest/${slug}/amenities`);
            return response?.data || response;
        } catch (error) {
            console.error('Failed to fetch amenities:', error);
            return [];
        }
    },

    /**
     * Fetch countries.
     */
    getCountries: async (slug) => {
        try {
            const response = await api.get(`guest/${slug}/countries`);
            return response?.data || response;
        } catch (error) {
            console.error('Failed to fetch countries:', error);
            return [];
        }
    },

    // Check availability for specific dates
    checkAvailability: async (slug, params) => {
        const query = new URLSearchParams(params).toString();
        return await api.get(`guest/${slug}/availability/check?${query}`);
    },

    /**
     * Store a new booking
     */
    createBooking: async (slug, bookingData) => {
        try {
            const response = await api.post(`guest/${slug}/bookings`, bookingData);
            return response?.data || response;
        } catch (error) {
            console.error('Failed to create booking:', error);
            throw new Error(error.response?.data?.message || 'Failed to complete booking. Please try again.');
        }
    }
};

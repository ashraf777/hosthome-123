
export const MOCK_PROPERTIES = [
    {
        id: "prop-1",
        name: "Luxury KLCC View Apartment",
        address_line_1: "Jalan Ampang",
        city: "Kuala Lumpur",
        listing_status: "active",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        price_per_night: 250
    },
    {
        id: "prop-2",
        name: "Penang Beachfront Villa",
        address_line_1: "Batu Ferringhi",
        city: "Penang",
        listing_status: "active",
        image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
        price_per_night: 450
    },
    {
        id: "prop-3",
        name: "Modern Studio in Johor Bahru",
        address_line_1: "Taman Molek",
        city: "Johor Bahru",
        listing_status: "active",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        price_per_night: 180
    },
    {
        id: "prop-4",
        name: "Heritage House in Malacca",
        address_line_1: "Jonker Street",
        city: "Malacca",
        listing_status: "active",
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
        price_per_night: 320
    }
];

export const MOCK_ROOM_TYPES = {
    "prop-1": [
        {
            id: "rt-1-1",
            name: "Master Suite",
            max_adults: 2,
            max_children: 1,
            weekday_price: 150,
            image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
            description: "A spacious master suite with a king-sized bed and en-suite bathroom."
        },
        {
            id: "rt-1-2",
            name: "Guest Room",
            max_adults: 2,
            max_children: 0,
            weekday_price: 100,
            image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80",
            description: "Cozy guest room perfect for couples or solo travelers."
        }
    ],
    "prop-2": [
        {
            id: "rt-2-1",
            name: "Ocean View Villa",
            max_adults: 4,
            max_children: 2,
            weekday_price: 450,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
            description: "Entire beachfront villa with panoramic ocean views."
        }
    ],
    "prop-3": [
        {
            id: "rt-3-1",
            name: "Modern Studio Room",
            max_adults: 2,
            max_children: 0,
            weekday_price: 180,
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
            description: "Modern studio in the heart of Johor Bahru."
        }
    ],
    "prop-4": [
        {
            id: "rt-4-1",
            name: "Heritage Suite",
            max_adults: 2,
            max_children: 2,
            weekday_price: 320,
            image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
            description: "A piece of history in the old town of Malacca."
        }
    ],
};

export const MALAYSIAN_CITIES = [
    "Kuala Lumpur",
    "Penang",
    "Johor Bahru",
    "Malacca",
    "Ipoh",
    "Kota Kinabalu",
    "Kuching"
];

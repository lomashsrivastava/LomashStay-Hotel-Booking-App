const cities = [
    { name: "New York", country: "USA" }, { name: "Los Angeles", country: "USA" }, { name: "Chicago", country: "USA" },
    { name: "London", country: "UK" }, { name: "Manchester", country: "UK" }, { name: "Liverpool", country: "UK" },
    { name: "Paris", country: "France" }, { name: "Lyon", country: "France" }, { name: "Marseille", country: "France" },
    { name: "Tokyo", country: "Japan" }, { name: "Osaka", country: "Japan" }, { name: "Kyoto", country: "Japan" },
    { name: "Dubai", country: "UAE" }, { name: "Abu Dhabi", country: "UAE" },
    { name: "Mumbai", country: "India" }, { name: "Delhi", country: "India" }, { name: "Bangalore", country: "India" },
    { name: "Sydney", country: "Australia" }, { name: "Melbourne", country: "Australia" },
    { name: "Toronto", country: "Canada" }, { name: "Vancouver", country: "Canada" },
    { name: "Berlin", country: "Germany" }, { name: "Munich", country: "Germany" },
    { name: "Rome", country: "Italy" }, { name: "Milan", country: "Italy" },
    { name: "Barcelona", country: "Spain" }, { name: "Madrid", country: "Spain" },
    { name: "Singapore", country: "Singapore" },
    { name: "Bangkok", country: "Thailand" }, { name: "Phuket", country: "Thailand" }
];

const adjectives = [
    "Grand", "Royal", "Luxury", "Cozy", "Urban", "Seaside", "Mountain", "Historic", "Modern", "Elite",
    "Premier", "Exclusive", "Boutique", "Elegant", "Charming", "Majestic", "Serene", "Tranquil", "Opulent", "Splendid"
];

const types = [
    "Hotel", "Resort", "Lodge", "Inn", "Suites", "Palace", "Retreat", "Manor", "Villa", "Hideaway"
];

const images = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1025&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1585543805890-6051f7829f98?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1049&q=80",
];

const generateHotels = (count = 5000) => {
    const hotels = [];
    for (let i = 1; i <= count; i++) {
        const cityObj = cities[Math.floor(Math.random() * cities.length)];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const type = types[Math.floor(Math.random() * types.length)];

        hotels.push({
            id: i,
            name: `${adj} ${cityObj.name} ${type}`,
            city: cityObj.name,
            country: cityObj.country,
            description: `Experience the best of ${cityObj.name}, ${cityObj.country} at our ${adj.toLowerCase()} ${type.toLowerCase()}. Top-rated amenities and service.`,
            price: Math.floor(Math.random() * 400) + 100, // 100 - 500
            rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
            image: images[Math.floor(Math.random() * images.length)]
        });
    }
    return hotels;
};

module.exports = generateHotels;

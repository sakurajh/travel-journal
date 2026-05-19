// ===== Photo Configuration =====
// Edit this file to add your own photos and customize the gallery

const PHOTO_CONFIG = {
    // Gallery title
    galleryTitle: 'BALI-26-R1',
    filmStock: 'KODAK PORTRA 400',
    totalFrames: 36,

    // Travel itinerary
    itinerary: [
        {
            index: '01',
            date: '04.26',
            location: 'BROMO',
            locationCn: '布罗莫火山',
            region: 'JAVA',
            regionCn: '爪哇',
            description: 'Volcanic sunrise over the Tengger caldera',
            // Replace with your image path: 'photos/bromo.jpg'
            image: null,
            colors: ['#E86435', '#8B2500', '#2D1B00', '#F4A460']
        },
        {
            index: '02',
            date: '04.27',
            location: 'IJEN',
            locationCn: '伊真火山',
            region: 'JAVA',
            regionCn: '爪哇',
            description: 'Blue flames and sulfur miners at dawn',
            image: null,
            colors: ['#1a3a4a', '#0d2b3e', '#2d5a6b', '#4a90a4']
        },
        {
            index: '03',
            date: '04.28',
            location: 'ULUWATU',
            locationCn: '乌鲁瓦图',
            region: 'BALI',
            regionCn: '巴厘岛',
            description: 'Clifftop temple and paragliders',
            image: null,
            colors: ['#2E8B57', '#1a5c3a', '#3cb371', '#87CEEB']
        },
        {
            index: '04',
            date: '04.30',
            location: 'UBUD',
            locationCn: '乌布',
            region: 'BALI',
            regionCn: '巴厘岛',
            description: 'Terraced rice fields in morning mist',
            image: null,
            colors: ['#4a7c3f', '#2d5a2a', '#6b8e4e', '#c5d5a0']
        },
        {
            index: '05',
            date: '05.01',
            location: 'NUSA PENIDA',
            locationCn: '佩尼达岛',
            region: 'PENIDA',
            regionCn: '佩尼达',
            description: 'Dramatic coastal cliffs and turquoise water',
            image: null,
            colors: ['#00CED1', '#008B8B', '#20B2AA', '#48D1CC']
        },
        {
            index: '06',
            date: '05.02',
            location: 'SEMINYAK',
            locationCn: '水明漾',
            region: 'BALI',
            regionCn: '巴厘岛',
            description: 'Golden hour on the beach',
            image: null,
            colors: ['#DAA520', '#B8860B', '#F4A460', '#FFD700']
        },
        {
            index: '07',
            date: '05.04',
            location: 'SINGAPORE',
            locationCn: '新加坡',
            region: 'SG',
            regionCn: '新加坡',
            description: 'Departure — SQ flight home',
            image: null,
            colors: ['#4169E1', '#1a237e', '#283593', '#7986cb']
        }
    ],

    // UI Labels (bilingual)
    labels: {
        mainTitle: 'BALI',
        yearTitle: '2026',
        subtitleCn: '巴厘・二〇二六',
        subtitleEn: 'A PHOTOGRAPHIC JOURNAL · EAST JAVA · BALI · SG',
        subtitleDesc: 'a roll exposed across two islands —',
        itineraryTitle: 'ITINERARY',
        enterButton: 'ENTER ROLL →',
        devInfo: 'DEV 06.04.2026',
        studio: 'BLACKWATER LAB',
        scrollHint: '← SCROLL TO EXPLORE →'
    },

    // Theme colors (customize these)
    theme: {
        bgPrimary: '#111111',
        bgSecondary: '#1a1a1a',
        accentOrange: '#E86435',
        accentCoral: '#E85D4A',
        textPrimary: '#F5F0E8',
        textSecondary: '#888888'
    }
};

// Export for use
if (typeof module !== 'undefined') {
    module.exports = PHOTO_CONFIG;
}

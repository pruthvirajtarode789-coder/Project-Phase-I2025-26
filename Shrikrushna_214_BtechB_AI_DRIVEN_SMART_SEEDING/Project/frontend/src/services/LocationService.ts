import { TALUKA_TRANSLATIONS } from '../data/TalukaData';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

interface OSMNode {
    id: number;
    tags: {
        name: string;
        "name:mr"?: string;
        "name:hi"?: string;
        [key: string]: string | undefined;
    };
}

interface OSMResponse {
    elements: OSMNode[];
}

export interface LocationItem {
    name: string;
    localNames: {
        mr?: string;
        hi?: string;
    };
}

// Cache to store results and avoid repeated API calls
const cache: {
    districts: LocationItem[] | null;
    talukas: Record<string, LocationItem[]>;
} = {
    districts: null,
    talukas: {},
};

// Manual fallback data for Maharashtra districts
const FALLBACK_DISTRICTS: LocationItem[] = [
    { name: "Ahmednagar", localNames: { mr: "अहमदनगर", hi: "अहमदनगर" } },
    { name: "Akola", localNames: { mr: "अकोला", hi: "अकोला" } },
    { name: "Amravati", localNames: { mr: "अमरावती", hi: "अमरावती" } },
    { name: "Aurangabad", localNames: { mr: "औरंगाबाद", hi: "औरंगाबाद" } }, // Now Chhatrapati Sambhajinagar, but keeping old name for compatibility if needed, or update both
    { name: "Beed", localNames: { mr: "बीड", hi: "बीड" } },
    { name: "Bhandara", localNames: { mr: "भंडारा", hi: "भंडारा" } },
    { name: "Buldhana", localNames: { mr: "बुलढाणा", hi: "बुलढाणा" } },
    { name: "Chandrapur", localNames: { mr: "चंद्रपूर", hi: "चंद्रपूर" } },
    { name: "Dhule", localNames: { mr: "धुळे", hi: "धुले" } },
    { name: "Gadchiroli", localNames: { mr: "गडचिरोली", hi: "गडचिरोली" } },
    { name: "Gondia", localNames: { mr: "गोंदिया", hi: "गोंदिया" } },
    { name: "Hingoli", localNames: { mr: "हिंगोली", hi: "हिंगोली" } },
    { name: "Jalgaon", localNames: { mr: "जळगाव", hi: "जलगांव" } },
    { name: "Jalna", localNames: { mr: "जालना", hi: "जालना" } },
    { name: "Kolhapur", localNames: { mr: "कोल्हापूर", hi: "कोल्हापुर" } },
    { name: "Latur", localNames: { mr: "लातूर", hi: "लातूर" } },
    { name: "Mumbai City", localNames: { mr: "मुंबई शहर", hi: "मुंबई शहर" } },
    { name: "Mumbai Suburban", localNames: { mr: "मुंबई उपनगर", hi: "मुंबई उपनगर" } },
    { name: "Nagpur", localNames: { mr: "नागपूर", hi: "नागपुर" } },
    { name: "Nanded", localNames: { mr: "नांदेड", hi: "नांदेड" } },
    { name: "Nandurbar", localNames: { mr: "नंदुरबार", hi: "नंदुरबार" } },
    { name: "Nashik", localNames: { mr: "नाशिक", hi: "नासिक" } },
    { name: "Osmanabad", localNames: { mr: "उस्मानाबाद", hi: "उस्मानाबाद" } }, // Dharashiv
    { name: "Palghar", localNames: { mr: "पालघर", hi: "पालघर" } },
    { name: "Parbhani", localNames: { mr: "परभणी", hi: "परभनी" } },
    { name: "Pune", localNames: { mr: "पुणे", hi: "पुणे" } },
    { name: "Raigad", localNames: { mr: "रायगड", hi: "रायगड" } },
    { name: "Ratnagiri", localNames: { mr: "रत्नागिरी", hi: "रत्नागिरी" } },
    { name: "Sangli", localNames: { mr: "सांगली", hi: "सांगली" } },
    { name: "Satara", localNames: { mr: "सातारा", hi: "सातारा" } },
    { name: "Sindhudurg", localNames: { mr: "सिंधुदुर्ग", hi: "सिंधुदुर्ग" } },
    { name: "Solapur", localNames: { mr: "सोलापूर", hi: "सोलापुर" } },
    { name: "Thane", localNames: { mr: "ठाणे", hi: "ठाणे" } },
    { name: "Wardha", localNames: { mr: "वर्धा", hi: "वर्धा" } },
    { name: "Washim", localNames: { mr: "वाशिम", hi: "वाशिम" } },
    { name: "Yavatmal", localNames: { mr: "यवतमाळ", hi: "यवतमाल" } }
];

export const LocationService = {
    /**
     * Fetches all districts in Maharashtra
     */
    getDistricts: async (): Promise<LocationItem[]> => {
        if (cache.districts) {
            return cache.districts;
        }

        const query = `
            [out:json][timeout:25];
            area["name"="Maharashtra"]->.searchArea;
            (
              relation["admin_level"="5"](area.searchArea);
            );
            out tags;
        `;

        try {
            const response = await fetch(OVERPASS_API_URL, {
                method: 'POST',
                body: query,
            });

            if (!response.ok) {
                throw new Error('Failed to fetch districts');
            }

            const data: OSMResponse = await response.json();
            const districts = data.elements
                .map(el => ({
                    name: el.tags.name,
                    localNames: {
                        mr: el.tags["name:mr"],
                        hi: el.tags["name:hi"]
                    }
                }))
                .filter(d => Boolean(d.name))
                .sort((a, b) => a.name.localeCompare(b.name));

            // Merge with fallback to ensure we have translations if API misses them
            const enrichedDistricts = districts.map(d => {
                const fallback = FALLBACK_DISTRICTS.find(f => f.name === d.name);
                if (fallback) {
                    return {
                        name: d.name,
                        localNames: {
                            mr: d.localNames.mr || fallback.localNames.mr,
                            hi: d.localNames.hi || fallback.localNames.hi
                        }
                    };
                }
                return d;
            });

            if (enrichedDistricts.length === 0) throw new Error("No districts found");

            cache.districts = enrichedDistricts;
            return enrichedDistricts;
        } catch (error) {
            console.error('Error fetching districts:', error);
            // Fallback to a basic list if API fails
            return FALLBACK_DISTRICTS;
        }
    },

    /**
     * Fetches all talukas for a given district
     */
    getTalukas: async (districtName: string): Promise<LocationItem[]> => {
        if (cache.talukas[districtName]) {
            return cache.talukas[districtName];
        }

        // Clean district name (remove "District" suffix if present, though OSM usually just has the name)
        const cleanDistrictName = districtName.replace(/ District$/i, '').trim();

        const query = `
            [out:json][timeout:25];
            area["name"="Maharashtra"]->.state;
            area["name"="${cleanDistrictName}"](area.state)->.district;
            (
              relation["admin_level"="6"](area.district);
            );
            out tags;
        `;

        try {
            const response = await fetch(OVERPASS_API_URL, {
                method: 'POST',
                body: query,
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch talukas for ${districtName}`);
            }

            const data: OSMResponse = await response.json();
            const talukas = data.elements
                .map(el => {
                    // Normalize name: remove " Taluka", " Tahsil" suffixes
                    const rawName = el.tags.name;
                    const normalizedName = rawName.replace(/ (Taluka|Tahsil)$/i, '').trim();

                    // Check manual translations
                    const manual = TALUKA_TRANSLATIONS[normalizedName];

                    // Fallback logic for Hindi:
                    // 1. API Hindi tag
                    // 2. Manual Hindi translation
                    // 3. API Marathi tag (often same script)
                    // 4. Manual Marathi translation
                    // 5. English name (last resort)
                    const hi = el.tags["name:hi"] || manual?.hi || el.tags["name:mr"] || manual?.mr || normalizedName;

                    // Fallback logic for Marathi:
                    // 1. API Marathi tag
                    // 2. Manual Marathi translation
                    // 3. English name
                    const mr = el.tags["name:mr"] || manual?.mr || normalizedName;

                    return {
                        name: normalizedName, // Use normalized name for display and value
                        localNames: { mr, hi }
                    };
                })
                .filter(t => Boolean(t.name))
                .sort((a, b) => a.name.localeCompare(b.name));

            if (talukas.length > 0) {
                cache.talukas[districtName] = talukas;
                return talukas;
            } else {
                return [];
            }
        } catch (error) {
            console.error(`Error fetching talukas for ${districtName}:`, error);
            return [];
        }
    }
};

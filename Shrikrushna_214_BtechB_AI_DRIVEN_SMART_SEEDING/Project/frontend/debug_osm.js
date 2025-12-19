
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

const checkTalukas = async (districtName) => {
    const cleanDistrictName = districtName.replace(/ District$/i, '').trim();
    console.log(`Checking talukas for: ${cleanDistrictName}`);

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

        console.log(`Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const text = await response.text();
            console.error(`API Error Body: ${text}`);
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Found ${data.elements.length} talukas.`);

        if (data.elements.length > 0) {
            const sample = data.elements.slice(0, 5);
            sample.forEach(el => {
                console.log(`Name: ${el.tags.name}`);
                console.log(`  - mr: ${el.tags['name:mr'] || 'MISSING'}`);
                console.log(`  - hi: ${el.tags['name:hi'] || 'MISSING'}`);
            });
        } else {
            console.log("No talukas found in response.");
        }

    } catch (error) {
        console.error('Fetch Error:', error);
    }
};

// Check Nagpur
checkTalukas('Nagpur');

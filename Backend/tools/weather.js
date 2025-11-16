const fetch=require('node-fetch')

async function getWeather(city) {
    try {
        // 1. Geocoding to get lat/lon
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            return {
                error: true,
                message: "City not found"
            };
        }

        const { latitude, longitude } = geoData.results[0];

        // 2. Weather API
        const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const wRes = await fetch(wUrl);
        const wData = await wRes.json();

        const weather = wData.current_weather;

        return {
            temperature: weather.temperature,
            windspeed: weather.windspeed,
            description: `Weather at ${city}`
        };
    } catch (err) {
        return {
            error: true,
            message: "Failed to fetch weather",
            details: err.message
        };
    }
}

module.exports=getWeather;

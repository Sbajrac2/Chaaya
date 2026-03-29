import { Router, type IRouter } from "express";
import { GetWeatherQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

// Uses Open-Meteo — completely free, no API key needed
// Docs: https://open-meteo.com/en/docs
router.get("/weather", async (req, res) => {
  const hour = new Date().getHours();
  const isDaytime = hour >= 7 && hour <= 18;

  const fallback = {
    temperature: 15,
    description: "Partly cloudy",
    uvIndex: isDaytime ? 3 : 0,
    sunlightHours: isDaytime ? 6 : 2,
    barometricPressure: 1013,
    isLowSunlight: false,
    city: "Your location",
  };

  try {
    const query = GetWeatherQueryParams.parse(req.query);
    const { lat, lon } = query;

    if (!lat || !lon || lat === 0 || lon === 0) {
      return res.json(fallback);
    }

    // Fetch current weather + UV index from Open-Meteo (free, no key)
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,surface_pressure,weather_code,uv_index` +
      `&daily=sunshine_duration,sunrise,sunset` +
      `&timezone=auto&forecast_days=1`;

    const response = await fetch(weatherUrl, { signal: AbortSignal.timeout(6000) });

    if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`);

    const data = await response.json() as {
      current: {
        temperature_2m: number;
        surface_pressure: number;
        weather_code: number;
        uv_index: number;
      };
      daily: {
        sunshine_duration: number[];
        sunrise: string[];
        sunset: string[];
      };
    };

    // WMO weather codes → human description
    const wmoCode = data.current.weather_code;
    const description = wmoToDescription(wmoCode);

    // Sunshine duration comes in seconds — convert to hours
    const sunlightHours = Math.round((data.daily.sunshine_duration?.[0] ?? 0) / 3600 * 10) / 10;
    const isLowSunlight = sunlightHours < 4;

    // Reverse geocode city name using nominatim (free)
    let city = "Your location";
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { "User-Agent": "Aasha-App/1.0" }, signal: AbortSignal.timeout(3000) }
      );
      if (geoRes.ok) {
        const geo = await geoRes.json() as { address?: { city?: string; town?: string; village?: string; suburb?: string } };
        city = geo.address?.city ?? geo.address?.town ?? geo.address?.village ?? geo.address?.suburb ?? "Your location";
      }
    } catch {
      // city stays as fallback
    }

    res.json({
      temperature: Math.round(data.current.temperature_2m),
      description,
      uvIndex: Math.round(data.current.uv_index * 10) / 10,
      sunlightHours,
      barometricPressure: Math.round(data.current.surface_pressure),
      isLowSunlight,
      city,
    });
  } catch (err) {
    console.warn("[API] Weather fetch failed, using fallback:", err);
    res.json(fallback);
  }
});

function wmoToDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rainy";
  if (code <= 79) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 84) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Cloudy";
}

export default router;

import { Router, type IRouter } from "express";
import { GetWeatherQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/weather", async (req, res) => {
  try {
    const query = GetWeatherQueryParams.parse(req.query);
    const { lat, lon } = query;

    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      const hour = new Date().getHours();
      const isDaytime = hour >= 7 && hour <= 18;
      return res.json({
        temperature: 15,
        description: "Partly cloudy",
        uvIndex: isDaytime ? 3 : 0,
        sunlightHours: isDaytime ? 6 : 2,
        barometricPressure: 1013,
        isLowSunlight: false,
        city: "Your city",
      });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Weather API error");
    }

    const data = await response.json() as {
      main: { temp: number; pressure: number };
      weather: Array<{ description: string }>;
      name: string;
      sys: { sunrise: number; sunset: number };
    };

    const sunriseMs = data.sys.sunrise * 1000;
    const sunsetMs = data.sys.sunset * 1000;
    const sunlightHours = (sunsetMs - sunriseMs) / (1000 * 60 * 60);

    const uvResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
    ).catch(() => null);

    let uvIndex = 0;
    if (uvResponse?.ok) {
      const uvData = await uvResponse.json() as { value: number };
      uvIndex = uvData.value;
    }

    const isLowSunlight = sunlightHours < 4;

    res.json({
      temperature: Math.round(data.main.temp),
      description: data.weather[0]?.description ?? "Clear",
      uvIndex,
      sunlightHours: Math.round(sunlightHours * 10) / 10,
      barometricPressure: data.main.pressure,
      isLowSunlight,
      city: data.name,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get weather");
    const hour = new Date().getHours();
    const isDaytime = hour >= 7 && hour <= 18;
    res.json({
      temperature: 15,
      description: "Partly cloudy",
      uvIndex: isDaytime ? 3 : 0,
      sunlightHours: isDaytime ? 6 : 2,
      barometricPressure: 1013,
      isLowSunlight: false,
      city: "Your city",
    });
  }
});

export default router;

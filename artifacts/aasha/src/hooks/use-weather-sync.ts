import { useState, useEffect } from "react";
import { useGetWeather } from "@workspace/api-client-react";

export function useGeolocation() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
          // Graceful degradation: we just won't have weather data
        },
        { timeout: 10000, maximumAge: 3600000 }
      );
    }
  }, []);

  return coords;
}

export function useWeatherSync() {
  const coords = useGeolocation();

  const weatherQuery = useGetWeather(
    coords ? { lat: coords.lat, lon: coords.lon } : { lat: 0, lon: 0 },
    { query: { enabled: !!coords, staleTime: 1000 * 60 * 30, queryKey: ['weather', coords?.lat, coords?.lon] } } // 30 min cache
  );

  return {
    weather: weatherQuery.data,
    isLoading: weatherQuery.isLoading,
    isSolarMode: weatherQuery.data?.isLowSunlight ?? false,
  };
}

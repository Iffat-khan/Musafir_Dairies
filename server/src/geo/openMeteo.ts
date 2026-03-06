import axios from "axios";

export async function geocodeCity(name: string): Promise<{ latitude: number; longitude: number } | null> {
  const url = "https://geocoding-api.open-meteo.com/v1/search";
  const res = await axios.get(url, {
    params: { name, count: 1, language: "en", format: "json" },
    timeout: 8000,
  });
  const first = res.data?.results?.[0];
  if (!first) return null;
  return { latitude: first.latitude, longitude: first.longitude };
}

export async function getWeatherSummary(lat: number, lon: number): Promise<string | null> {
  const url = "https://api.open-meteo.com/v1/forecast";
  const res = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lon,
      current: "temperature_2m,weather_code,wind_speed_10m",
      timezone: "auto",
    },
    timeout: 8000,
  });
  const cur = res.data?.current;
  if (!cur) return null;
  const t = cur.temperature_2m;
  const wind = cur.wind_speed_10m;
  return `Current temp ${t}°C, wind ${wind} km/h`;
}


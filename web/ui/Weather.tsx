import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react';

type Reading = { temp: number; code: number; isDay: boolean };

const LOCATION_KEY = 'weather-location';
const REFRESH_MS = 30 * 60 * 1000;

/** WMO weather codes, same buckets as the original widget. */
export function describeWeather(code: number): string {
  if (code === 0) return 'Clear';
  if (code >= 1 && code <= 3) return 'Partly cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Weather';
}

function Icon({ code, isDay }: Reading) {
  const cls = 'size-3.5';
  if (code === 0) return isDay ? <Sun className={cls} /> : <Moon className={cls} />;
  if (code <= 3) return isDay ? <CloudSun className={cls} /> : <Cloud className={cls} />;
  if (code >= 45 && code <= 48) return <CloudFog className={cls} />;
  if (code >= 51 && code <= 57) return <CloudDrizzle className={cls} />;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={cls} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <CloudSnow className={cls} />;
  if (code >= 95) return <CloudLightning className={cls} />;
  return <Cloud className={cls} />;
}

/**
 * Current weather, as in the original app: Open-Meteo for the forecast, the visitor's
 * approximate location from their IP (cached after the first lookup). Fails quietly.
 */
export function Weather({ unit }: { unit: 'celsius' | 'fahrenheit' }) {
  const [reading, setReading] = useState<Reading | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchWeather = async (lat: number, lon: number) => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&temperature_unit=${unit}`
      );
      if (!res.ok) throw new Error('weather');
      const c = (await res.json()).current;
      if (alive) setReading({ temp: Math.round(c.temperature_2m), code: c.weather_code, isDay: !!c.is_day });
    };

    const locate = async (): Promise<{ lat: number; lon: number } | null> => {
      try {
        const cached = JSON.parse(localStorage.getItem(LOCATION_KEY) || 'null');
        if (cached && typeof cached.lat === 'number' && typeof cached.lon === 'number') return cached;
      } catch {
        /* ignore */
      }
      try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (!data.success) return null;
        const loc = { lat: data.latitude, lon: data.longitude };
        localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
        return loc;
      } catch {
        return null;
      }
    };

    const load = async () => {
      const loc = await locate();
      if (!loc) return;
      try {
        await fetchWeather(loc.lat, loc.lon);
      } catch {
        /* keep the last reading */
      }
    };

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [unit]);

  if (!reading) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      title={describeWeather(reading.code)}
      className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-full bg-subtle px-2.5 text-[12px] font-medium text-muted"
    >
      <Icon {...reading} />
      <span className="tabular text-fg">
        {reading.temp}°{unit === 'celsius' ? 'C' : 'F'}
      </span>
    </motion.div>
  );
}

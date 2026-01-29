import React from 'react';
import { Cloud, CloudRain, Sun, CloudLightning, CloudSnow, Loader2, MapPin, CloudOff, Moon, CloudFog, CloudDrizzle } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherData {
    temp: number;
    description: string;
    code: number;
    isDay: boolean; // 1 = day, 0 = night
}

export default function WeatherWidget({ isDark, unit = 'celsius' }: { isDark: boolean; unit?: 'celsius' | 'fahrenheit' }) {
    const [weather, setWeather] = React.useState<WeatherData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const fetchWeather = async (latitude: number, longitude: number) => {
            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&temperature_unit=${unit}`
                );

                if (!res.ok) throw new Error('Failed to fetch weather');

                const data = await res.json();
                const current = data.current;

                if (isMounted) {
                    setWeather({
                        temp: Math.round(current.temperature_2m),
                        code: current.weather_code,
                        description: getWeatherDescription(current.weather_code),
                        isDay: !!current.is_day
                    });
                    setLoading(false);
                    // Cache the successful location
                    localStorage.setItem('weather-location', JSON.stringify({ lat: latitude, lon: longitude }));
                }
            } catch (err) {
                if (isMounted) {
                    // Only show error if we don't have weather data yet (e.g. from cache)
                    setError(prev => prev || 'Weather unavailable');
                    setLoading(false);
                }
                console.error(err);
            }
        };

        const fetchLocationByIP = async () => {
            try {
                // Try ipwho.is (free, no key, higher limits)
                const res = await fetch('https://ipwho.is/');
                if (!res.ok) throw new Error('IP service failed');

                const data = await res.json();
                if (!data.success) throw new Error('IP geolocation lookup failed');

                if (data.latitude && data.longitude) {
                    fetchWeather(data.latitude, data.longitude);
                } else {
                    throw new Error('Invalid IP data');
                }
            } catch (err) {
                console.warn('IP location failed:', err);
                if (isMounted) {
                    // Keep loading false if we failed but maybe cache worked?
                    // Actually better to show error if we have nothing.
                    setLoading(false);
                    setError(prev => prev ? prev : 'Unable to detect location');
                }
            }
        };

        // 1. Try to load from cache immediately for instant UI
        const cached = localStorage.getItem('weather-location');
        if (cached) {
            try {
                const { lat, lon } = JSON.parse(cached);
                if (lat && lon) fetchWeather(lat, lon);
            } catch (e) {
                console.error('Invalid weather cache');
            }
        }

        // Use IP-based location (no browser permission prompt)
        fetchLocationByIP();

        return () => { isMounted = false; };
    }, [unit]);

    function getWeatherDescription(code: number): string {
        // WMO Weather interpretation codes (WW)
        if (code === 0) return 'Clear';
        if (code >= 1 && code <= 3) return 'Partly Cloudy';
        if (code >= 45 && code <= 48) return 'Foggy';
        if (code >= 51 && code <= 67) return 'Rain';
        if (code >= 71 && code <= 77) return 'Snow';
        if (code >= 80 && code <= 82) return 'Showers';
        if (code >= 85 && code <= 86) return 'Snow Showers';
        if (code >= 95 && code <= 99) return 'Thunderstorm';
        return 'Unknown';
    }

    function getWeatherIcon(code: number, isDay: boolean) {
        const className = "w-5 h-5";

        // Clear Sky
        if (code === 0) {
            return isDay
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}><Sun className={`${className} text-yellow-500`} /></motion.div>
                : <motion.div animate={{ rotate: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}><Moon className={`${className} text-indigo-300`} /></motion.div>;
        }

        // Clouds / Overcast
        if (code >= 1 && code <= 3) {
            // Check if mostly cloudy (3) vs partly (1-2). For simplicity, verify day/night only for partly/clear mix?
            // Usually valid to show Moon+Cloud at night
            return (
                <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Cloud className={`${className} text-sky-400`} />
                </motion.div>
            );
        }

        // Rain / Drizzle
        if (code >= 51 && code <= 67) {
            return (
                <motion.div animate={{ y: [0, 2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                    <CloudRain className={`${className} text-blue-500`} />
                </motion.div>
            );
        }

        // Snow
        if (code >= 71 && code <= 77) {
            return (
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    <CloudSnow className={`${className} text-indigo-300`} />
                </motion.div>
            );
        }

        // Fog
        if (code >= 45 && code <= 48) {
            return (
                <motion.div animate={{ opacity: [0.5, 1, 0.5], x: [-2, 2, -2] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                    <CloudFog className={`${className} text-slate-400`} />
                </motion.div>
            );
        }

        // Showers (Rain)
        if (code >= 80 && code <= 82) {
            return (
                <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                    <CloudDrizzle className={`${className} text-blue-400`} />
                </motion.div>
            );
        }

        // Snow Showers
        if (code >= 85 && code <= 86) {
            return (
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <CloudSnow className={`${className} text-indigo-300`} />
                </motion.div>
            );
        }

        // Thunderstorm
        if (code >= 95) {
            return (
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                    <CloudLightning className={`${className} text-purple-500`} />
                </motion.div>
            );
        }

        // Default
        return <Sun className={`${className} text-orange-400`} />;
    }

    if (loading) return (
        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-white/50 border-slate-200 text-slate-500'
            }`}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
        </div>
    );

    if (error) return (
        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border backdrop-blur-sm ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-600'
            }`}>
            <CloudOff className="w-4 h-4" />
            <span>{error}</span>
        </div>
    );

    return (
        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border shadow-sm backdrop-blur-sm ${isDark
            ? 'bg-slate-800/60 border-slate-700 text-slate-200'
            : 'bg-white/80 border-slate-200 text-slate-700'
            }`}>
            {getWeatherIcon(weather!.code, weather!.isDay)}
            <span className="font-semibold">{weather?.temp}°{unit === 'celsius' ? 'C' : 'F'}</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {weather?.description}
            </span>
        </div>
    );
}

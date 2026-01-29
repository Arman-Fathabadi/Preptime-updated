import React from 'react';
import { Cloud, CloudRain, Sun, CloudLightning, CloudSnow, Loader2, MapPin } from 'lucide-react';

interface WeatherData {
    temp: number;
    description: string;
    code: number;
}

export default function WeatherWidget({ isDark }: { isDark: boolean }) {
    const [weather, setWeather] = React.useState<WeatherData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Fetch from Open-Meteo (Free, no key)
                    const res = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
                    );

                    if (!res.ok) throw new Error('Failed to fetch weather');

                    const data = await res.json();
                    const current = data.current;

                    setWeather({
                        temp: Math.round(current.temperature_2m),
                        code: current.weather_code,
                        description: getWeatherDescription(current.weather_code)
                    });
                } catch (err) {
                    setError('Weather unavailable');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setError('Location access denied');
                setLoading(false);
            }
        );
    }, []);

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

    function getWeatherIcon(code: number) {
        const className = "w-5 h-5";
        if (code === 0) return <Sun className={`${className} text-yellow-500`} />;
        if (code >= 1 && code <= 3) return <Cloud className={`${className} text-sky-400`} />;
        if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-500`} />;
        if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-indigo-300`} />;
        if (code >= 95) return <CloudLightning className={`${className} text-purple-500`} />;
        return <Sun className={`${className} text-orange-400`} />;
    }

    if (loading) return (
        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-white/50 border-slate-200 text-slate-500'
            }`}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
        </div>
    );

    if (error) return null; // Hide on error to not clutter UI

    return (
        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border shadow-sm backdrop-blur-sm ${isDark
                ? 'bg-slate-800/60 border-slate-700 text-slate-200'
                : 'bg-white/80 border-slate-200 text-slate-700'
            }`}>
            {getWeatherIcon(weather!.code)}
            <span className="font-semibold">{weather?.temp}°F</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {weather?.description}
            </span>
        </div>
    );
}

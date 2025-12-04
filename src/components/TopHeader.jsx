"use client";
import { useState, useEffect } from "react";

export default function TopHeader() {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        if (!API_KEY) {
            console.error(
                "Missing NEXT_PUBLIC_WEATHER_API_KEY environment variable",
            );
            setError("No API key");
            return;
        }

        let mounted = true;

        const fetchWeather = async (lat, lon) => {
            try {
                const res = await fetch(
                    `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`,
                );
                if (!res.ok)
                    throw new Error(`Weather API responded with ${res.status}`);
                const data = await res.json();
                if (mounted) setWeather(data);
            } catch (err) {
                console.error(err);
                if (mounted) setError(err.message || "Failed to fetch weather");
            }
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                (geoError) => {
                    console.warn("Geolocation error:", geoError);
                    setError("Location unavailable");
                },
            );
        } else {
            setError("Geolocation not supported");
        }

        return () => {
            mounted = false;
        };
    }, []);

    const [mounted, setMounted] = useState(false);
    const [clientToday, setClientToday] = useState(null);

    useEffect(() => {
        // compute date on client only to avoid SSR/CSR mismatch
        setMounted(true);
        setClientToday(
            new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
        );
    }, []);

    const iconSrc = weather?.current?.condition?.icon
        ? weather.current.condition.icon.startsWith("//")
            ? `https:${weather.current.condition.icon}`
            : weather.current.condition.icon
        : null;

    return (
        <header className="bg-black text-white text-sm">
            <div className="mx-auto w-full max-w-2xl px-2">
                {/* small height header showing date, city and weather */}
                <div className="h-8 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {iconSrc ? (
                            <img
                                src={iconSrc}
                                alt={
                                    weather?.current?.condition?.text ??
                                    "Weather"
                                }
                                className="h-5 w-5 flex-shrink-0"
                            />
                        ) : (
                            <div className="h-5 w-5 flex-shrink-0" />
                        )}
                        <span className="truncate">
                            {weather?.location?.name ??
                                (error ? "Unknown" : "Loading...")}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {mounted ? (
                            <span className="whitespace-nowrap">
                                {clientToday}
                            </span>
                        ) : (
                            <span className="whitespace-nowrap">--</span>
                        )}
                        {weather && (
                            <span className="whitespace-nowrap">
                                {Math.round(weather.current.temp_c)}°C
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

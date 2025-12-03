"use client";

import React, { useEffect, useState } from "react";

/**
 * WeatherHeader
 *
 * Behavior:
 * - Attempts to get user geolocation.
 * - Attempts to reverse-geocode the coordinates to a city name (Nominatim).
 * - If reverse-geocoding fails (no city), per requirement: show London weather info.
 * - If reverse-geocoding succeeds: fetch weather for the user's coordinates.
 * - If an OpenWeatherMap API key is present at build time as `process.env.WEATHER_API_KEY`,
 *   the component will use OpenWeatherMap's One Call API (v3) to fetch current weather (metric units).
 *   Otherwise it falls back to Open-Meteo for current weather.
 *
 * Note: Exposing a raw API key in client-side code may not be secure. In production consider
 * proxying requests through your server or using a NEXT_PUBLIC_ prefixed env var with appropriate controls.
 */

/* ---------------------- Types ---------------------- */

type OpenMeteoResponse = {
    current_weather?: {
        temperature: number;
        windspeed: number;
        weathercode: number;
    };
};

type OpenWeatherCurrent = {
    temp: number;
    wind_speed?: number; // older versions use wind_speed; main OpenWeather uses wind.speed — we'll guard
    weather?: Array<{
        id: number;
        main: string;
        description: string;
        icon?: string;
    }>;
    wind?: { speed?: number };
};

type OpenWeatherResponse = {
    current?: OpenWeatherCurrent;
};

type ReverseGeocodeResponse = {
    address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        county?: string;
    };
    display_name?: string;
};

type WeatherState = {
    city: string;
    temperature: number | null;
    windspeed: number | null;
    code: number | null; // weather code (OpenWeatherMap id or Open-Meteo weathercode)
    icon: string;
};

/* ---------------------- Constants ---------------------- */

const LONDON_COORDS = { lat: 51.5074, lon: -0.1278, city: "London" };

/* Read API key at build time (this will be inlined by tooling like Next.js if present).
   If you expect to use a client-exposed key, consider naming it NEXT_PUBLIC_... in env.
*/
const OPENWEATHER_API_KEY =
    typeof process !== "undefined"
        ? (process.env as any).WEATHER_API_KEY
        : undefined;

/* ---------------------- Helpers ---------------------- */

/**
 * Map OpenWeatherMap weather id (grouped) to emoji icon.
 * OpenWeatherMap ids:
 * 2xx - Thunderstorm
 * 3xx - Drizzle
 * 5xx - Rain
 * 6xx - Snow
 * 7xx - Atmosphere (mist, smoke, haze, etc.)
 * 800 - Clear
 * 80x - Clouds
 */
function openWeatherIdToEmoji(id: number | null): string {
    if (id === null) return "🌤️";
    if (id >= 200 && id < 300) return "⛈️";
    if (id >= 300 && id < 400) return "🌦️";
    if (id >= 500 && id < 600) return "🌧️";
    if (id >= 600 && id < 700) return "❄️";
    if (id >= 700 && id < 800) return "🌫️";
    if (id === 800) return "☀️";
    if (id === 801) return "🌤️";
    if (id === 802) return "⛅";
    if (id === 803 || id === 804) return "☁️";
    return "🌤️";
}

/**
 * Map Open-Meteo weathercode to emoji.
 * Small subset mapping similar to previous implementation.
 */
function openMeteoCodeToEmoji(code: number | null): string {
    if (code === null) return "🌤️";
    if (code === 0) return "☀️";
    if (code === 1 || code === 2) return "🌤️";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 55) return "🌦️";
    if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return "🌧️";
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "❄️";
    if (code >= 95 && code <= 99) return "⛈️";
    return "🌤️";
}

/* ---------------------- Component ---------------------- */

export default function WeatherHeader(): JSX.Element {
    const [state, setState] = useState<WeatherState>({
        city: "",
        temperature: null,
        windspeed: null,
        code: null,
        icon: "🌤️",
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function reverseGeocode(
            lat: number,
            lon: number,
        ): Promise<string | null> {
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
                    lat,
                )}&lon=${encodeURIComponent(lon)}&format=jsonv2`;
                const res = await fetch(url, {
                    headers: {
                        "User-Agent":
                            "news-articles-weather-header/1.0 (+https://example.com)",
                        Accept: "application/json",
                    },
                });
                if (!res.ok) return null;
                const data = (await res.json()) as ReverseGeocodeResponse;
                const addr = data.address;
                if (!addr) return data.display_name ?? null;
                return (
                    addr.city ??
                    addr.town ??
                    addr.village ??
                    addr.municipality ??
                    addr.county ??
                    data.display_name ??
                    null
                );
            } catch {
                return null;
            }
        }

        async function fetchFromOpenMeteo(
            lat: number,
            lon: number,
            cityName?: string,
        ) {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(
                    lon,
                )}&current_weather=true`;
                const res = await fetch(url);
                if (!res.ok)
                    throw new Error(`Open-Meteo fetch failed: ${res.status}`);
                const data = (await res.json()) as OpenMeteoResponse;
                const current = data.current_weather;
                if (!current) throw new Error("Open-Meteo: no current weather");
                if (!mounted) return;
                const icon = openMeteoCodeToEmoji(current.weathercode ?? null);
                setState({
                    city: cityName ?? "",
                    temperature: Math.round(current.temperature * 10) / 10,
                    windspeed: Math.round((current.windspeed ?? 0) * 10) / 10,
                    code: current.weathercode ?? null,
                    icon,
                });
                setError(null);
            } catch (err) {
                if (!mounted) return;
                setError(String(err instanceof Error ? err.message : err));
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }

        async function fetchFromOpenWeather(
            lat: number,
            lon: number,
            cityName?: string,
        ) {
            // Use One Call v3 endpoint as provided by the user. Request metric units to get Celsius.
            try {
                if (!OPENWEATHER_API_KEY)
                    throw new Error("OpenWeather API key missing");
                const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${encodeURIComponent(
                    lat,
                )}&lon=${encodeURIComponent(lon)}&units=metric&exclude=minutely,hourly,daily,alerts&appid=${encodeURIComponent(
                    OPENWEATHER_API_KEY,
                )}`;
                const res = await fetch(url);
                if (!res.ok)
                    throw new Error(`OpenWeather fetch failed: ${res.status}`);
                const data = (await res.json()) as OpenWeatherResponse;
                const current = data.current;
                if (!current)
                    throw new Error("OpenWeather: no current weather");
                if (!mounted) return;

                // Extract id (weather[0].id) and temp, wind
                const weatherId =
                    current.weather && current.weather[0]
                        ? current.weather[0].id
                        : null;
                const wind =
                    current.wind?.speed ??
                    (current.wind_speed as number | undefined) ??
                    null;
                const icon = openWeatherIdToEmoji(weatherId ?? null);

                setState({
                    city: cityName ?? "",
                    temperature: Math.round((current.temp ?? NaN) * 10) / 10,
                    windspeed:
                        wind !== null ? Math.round(wind * 10) / 10 : null,
                    code: weatherId ?? null,
                    icon,
                });
                setError(null);
            } catch (err) {
                if (!mounted) return;
                setError(String(err instanceof Error ? err.message : err));
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }

        async function useLondonFallback() {
            // Per requirement: if we fail to get a city, show London weather info.
            // Use OpenWeather if key present, otherwise Open-Meteo.
            if (OPENWEATHER_API_KEY) {
                await fetchFromOpenWeather(
                    LONDON_COORDS.lat,
                    LONDON_COORDS.lon,
                    LONDON_COORDS.city,
                );
            } else {
                await fetchFromOpenMeteo(
                    LONDON_COORDS.lat,
                    LONDON_COORDS.lon,
                    LONDON_COORDS.city,
                );
            }
        }

        async function init() {
            setLoading(true);
            setError(null);

            if (
                typeof navigator === "undefined" ||
                !("geolocation" in navigator)
            ) {
                // No geolocation -> fallback to London
                await useLondonFallback();
                return;
            }

            const success = async (position: GeolocationPosition) => {
                if (!mounted) return;
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // If we fail to obtain a city name via reverse geocode, the requirement is to show London weather info.
                const cityName = await reverseGeocode(lat, lon);
                if (!cityName) {
                    await useLondonFallback();
                    return;
                }

                // We have a city name -> fetch weather for user's coords (and show the city).
                if (OPENWEATHER_API_KEY) {
                    await fetchFromOpenWeather(lat, lon, cityName);
                } else {
                    await fetchFromOpenMeteo(lat, lon, cityName);
                }
            };

            const failure = async (_err: GeolocationPositionError) => {
                if (!mounted) return;
                await useLondonFallback();
            };

            try {
                navigator.geolocation.getCurrentPosition(success, failure, {
                    maximumAge: 60_000,
                    timeout: 8_000,
                    enableHighAccuracy: false,
                });
            } catch {
                await useLondonFallback();
            }
        }

        init();

        return () => {
            mounted = false;
        };
    }, []);

    /* ---------------------- Presentation ---------------------- */

    const headerStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 8px",
        height: 36,
        fontSize: 13,
        lineHeight: "16px",
    };

    const iconStyle: React.CSSProperties = {
        fontSize: 18,
        lineHeight: "18px",
    };

    return (
        <header
            className="bg-stone-800 text-white"
            role="banner"
            style={headerStyle}
            aria-live="polite"
        >
            <div className="m-auto px-4 sm:w-2xl">
                {loading ? (
                    <>
                        <span style={iconStyle} aria-hidden>
                            ⏳
                        </span>
                        <span>Loading weather…</span>
                    </>
                ) : error ? (
                    <>
                        <span style={iconStyle} aria-hidden>
                            ⚠️
                        </span>
                        <span style={{ whiteSpace: "nowrap" }}>
                            Weather unavailable
                        </span>
                        <span
                            style={{
                                marginLeft: 8,
                                color: "rgba(0,0,0,0.6)",
                                fontSize: 12,
                            }}
                        >
                            {state.city || LONDON_COORDS.city}
                        </span>
                    </>
                ) : (
                    <>
                        <span style={iconStyle} aria-hidden>
                            {state.icon}
                        </span>

                        <span style={{ fontWeight: 600 }}>
                            {state.city || LONDON_COORDS.city}
                        </span>

                        <span style={{ marginLeft: 6 }}>
                            {state.temperature !== null
                                ? `${state.temperature}°C`
                                : "—"}
                        </span>

                        <span
                            style={{
                                marginLeft: 8,
                                fontSize: 12,
                            }}
                        >
                            {state.windspeed !== null
                                ? `${state.windspeed} m/s`
                                : ""}
                        </span>
                    </>
                )}
            </div>
        </header>
    );
}

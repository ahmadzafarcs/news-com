"use client";

import React, { useState } from "react";
import WeatherHeader from "./WeatherHeader";
import Link from "next/link";

type NavLink = {
    title: string;
    href: string;
};

const NAV_LINKS: NavLink[] = [
    { title: "Home", href: "/" },
    { title: "World", href: "/world" },
    { title: "Politics", href: "/politics" },
    { title: "Business", href: "/business" },
    { title: "Tech", href: "/tech" },
    { title: "Culture", href: "/culture" },
];

export default function Header(): JSX.Element {
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");

    function handleToggleMobile() {
        setMobileOpen((v) => !v);
    }

    function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: wire to search results page or search handler
        // For now, navigate or log
        // Example: router.push(`/search?q=${encodeURIComponent(query)}`)
        // eslint-disable-next-line no-console
        console.log("Search:", query);
    }

    return (
        <header className="w-full bg-white dark:bg-slate-900 shadow-sm">
            {/* Mini top bar with weather — compact and fits at the top */}
            <div className="w-full">
                <WeatherHeader />
            </div>

            {/* Main navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and brand */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-3 text-slate-900 dark:text-slate-100"
                            aria-label="News Home"
                        >
                            {/* Simple logo: newspaper icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-red-600 text-white dark:bg-red-500">
                                <svg
                                    className="w-6 h-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden
                                >
                                    <path
                                        d="M4 7H20M4 11H20M4 15H14"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <div className="font-semibold text-sm">
                                    The Daily Report
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Independent journalism
                                </div>
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                >
                                    {link.title}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Search and actions */}
                    <div className="flex items-center gap-3">
                        {/* Search - visible on md+ */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-md px-2 py-1"
                            role="search"
                            aria-label="Site search"
                        >
                            <label htmlFor="site-search" className="sr-only">
                                Search articles
                            </label>
                            <input
                                id="site-search"
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search news..."
                                className="bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 px-2"
                            />
                            <button
                                type="submit"
                                className="text-slate-600 dark:text-slate-300 hover:text-red-600 px-2"
                                aria-label="Search"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                                    />
                                </svg>
                            </button>
                        </form>

                        {/* Subscribe / CTA */}
                        <a
                            href="/subscribe"
                            className="hidden sm:inline-block text-sm px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                        >
                            Subscribe
                        </a>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={handleToggleMobile}
                                aria-label={
                                    mobileOpen ? "Close menu" : "Open menu"
                                }
                                aria-expanded={mobileOpen}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                            >
                                {mobileOpen ? (
                                    // Close icon
                                    <svg
                                        className="w-6 h-6"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                ) : (
                                    // Hamburger
                                    <svg
                                        className="w-6 h-6"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu panel */}
            <div
                className={`md:hidden transition-max-h duration-300 ease-in-out overflow-hidden bg-white dark:bg-slate-900 ${
                    mobileOpen ? "max-h-screen" : "max-h-0"
                }`}
                aria-hidden={!mobileOpen}
            >
                <div className="px-4 pt-4 pb-6 space-y-3">
                    <nav className="flex flex-col gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block px-2 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                {link.title}
                            </a>
                        ))}
                    </nav>

                    <form
                        onSubmit={(e) => {
                            handleSearchSubmit(e);
                            setMobileOpen(false);
                        }}
                        className="flex items-center gap-2 mt-2"
                        role="search"
                        aria-label="Mobile search"
                    >
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search news..."
                            className="flex-1 px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
                        />
                        <button
                            type="submit"
                            className="px-3 py-2 rounded-md bg-red-600 text-white"
                        >
                            Search
                        </button>
                    </form>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <a
                            href="/subscribe"
                            className="block w-full text-center px-3 py-2 rounded-md bg-red-600 text-white"
                        >
                            Subscribe
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}

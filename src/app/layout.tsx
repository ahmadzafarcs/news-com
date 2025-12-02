import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "News",
    description: "News Website, stay updated",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`antialiased`}>{children}</body>
        </html>
    );
}

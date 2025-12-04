import type { Metadata } from "next";
import "./globals.css";
import TopHeader from "@/components/TopHeader";

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
            <body className={`antialiased`}>
                <TopHeader />
                <main>{children}</main>
            </body>
        </html>
    );
}

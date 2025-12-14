import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsuranceIQ - AI Insurance Research Tool",
  description: "AI-powered insurance research and recommendation tool for independent agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600">Insurance</span>
                  <span className="text-2xl font-bold text-gray-800">IQ</span>
                </Link>
                <div className="hidden md:flex ml-10 space-x-8">
                  <Link href="/personal" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Personal Lines
                  </Link>
                  <Link href="/commercial" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Commercial Lines
                  </Link>
                  <Link href="/carriers" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Carrier Appetite
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Agent Dashboard</span>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

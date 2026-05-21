import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Providers from "./Providers";

export const metadata: Metadata = {
  title: "SME PNG Online Market | Buy & Sell in Papua New Guinea",
  description: "A premium PNG-first marketplace connecting SMEs, vendors, businesses, and service providers with buyers across New Ireland, East New Britain, and West New Britain.",
  keywords: "SME, PNG, Papua New Guinea, Marketplace, Buy, Sell, Vendors, Products, Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-container">
            <Header />
            
            <main className="main-content">
              {children}
            </main>

            <footer className="main-footer">
              <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} SME PNG Online Market. All rights reserved.</p>
                <p className="footer-links">
                  <a href="#">Privacy</a> | <a href="#">Terms</a> | <a href="#">Report Scam</a>
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

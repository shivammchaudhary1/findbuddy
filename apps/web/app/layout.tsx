import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getWebsiteData } from "@/lib/data";
import { DemoProvider } from "@/hooks/demo-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FindBuddy",
  description: getWebsiteData().site.tagline,
  icons: {
    icon: "/brand/findbuddy-symbol.png",
    apple: "/brand/findbuddy-symbol.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { site, navigation } = getWebsiteData();
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header links={navigation.main} />
        <DemoProvider initialData={getWebsiteData()}>{children}</DemoProvider>
        <Footer business={site.business} tagline={site.tagline} />
        <div className="demo-notice">{site.demoNotice}</div>
      </body>
    </html>
  );
}

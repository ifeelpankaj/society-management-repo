import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { rootMetadata } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";
import { StoreProvider } from "@/store/provider";
import { ThemeProvider } from "@/theme/theme-provider";

const robotoHeading = Roboto({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        robotoHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>{children}</StoreProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";
import { IntroSplash } from "@/components/splash/intro-splash";
import { SPLASH_STORAGE_KEY } from "@/lib/design-tokens";

export const metadata: Metadata = {
  title: {
    default: "Lugie Global Consultancy – Dream Beyond Borders",
    template: "%s | Lugie Global Consultancy",
  },
  description:
    "Expert overseas education consultancy helping students achieve their dream of studying abroad. University admissions, visa guidance, scholarships, and more.",
};

const PRE_PAINT_INTRO_GUARD = `
try {
  var p = window.location.pathname;
  var firstPublicVisit = (p === "/" || p === "") &&
    !window.localStorage.getItem("${SPLASH_STORAGE_KEY}") &&
    !window.localStorage.getItem("lugie_access_token") &&
    !window.localStorage.getItem("lugie_refresh_token") &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (firstPublicVisit) {
    document.documentElement.classList.add("lugie-intro-active");
    window.setTimeout(function () {
      document.documentElement.classList.remove("lugie-intro-active");
    }, 1200);
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_INTRO_GUARD }} />
      </head>
      <body className="bg-[#F3F0E8] font-sans text-[#394B49] antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <IntroSplash />
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "#FFFFFF",
                    color: "#394B49",
                    border: "1px solid #DCE5E8",
                    boxShadow: "0 10px 25px -5px rgba(57, 75, 73, 0.12)",
                  },
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

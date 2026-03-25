import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider"; // <-- Import your new wrapper

export const metadata = {
  title: "Schema Studio",
  description: "Visual database schema designer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning is required for next-themes to work without React errors
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        {/* Wrap everything in your client-side AuthProvider */}
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
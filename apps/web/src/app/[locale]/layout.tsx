import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ClientOnly from "@/components/ClientOnly";
import "../globals.css";

export const metadata: Metadata = {
  title: "SupportFlow AI | Enterprise AI Support",
  description: "Next-generation AI customer support platform.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Fetch messages based on locale
  const messages = await getMessages();

  // Determine text direction
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Automatically strip browser extension attributes that cause hydration warnings
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (document.body && document.body.hasAttribute('cz-shortcut-listen')) {
                    document.body.removeAttribute('cz-shortcut-listen');
                  }
                });
              });
              observer.observe(document.documentElement, { attributes: true, subtree: true });
            `
          }}
        />
      </head>
      <body className="antialiased" cz-shortcut-listen="true" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <ClientOnly>
              {children}
            </ClientOnly>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

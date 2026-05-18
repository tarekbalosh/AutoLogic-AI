'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (newLocale: string) => {
    // Basic implementation for changing locale route prefix
    // e.g., /ar/dashboard -> /en/dashboard
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    
    // Also set cookie so middleware remembers preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    
    router.push(newPath || `/${newLocale}`);
    router.refresh();
  };

  return (
    <div className="relative group inline-block">
      <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
        <Globe className="w-4 h-4" />
        {locale === 'ar' ? 'العربية' : 'English'}
      </button>
      
      <div className="absolute right-0 mt-2 w-32 bg-[#18181b] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <button 
          onClick={() => handleSwitch('ar')}
          className="w-full text-start px-4 py-2 text-sm hover:bg-white/5 rounded-t-xl"
        >
          🇸🇦 العربية
        </button>
        <button 
          onClick={() => handleSwitch('en')}
          className="w-full text-start px-4 py-2 text-sm hover:bg-white/5 rounded-b-xl"
        >
          🇺🇸 English
        </button>
      </div>
    </div>
  );
}

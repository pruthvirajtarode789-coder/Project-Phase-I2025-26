import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳', nativeName: 'हिंदी' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳', nativeName: 'मराठी' },
  ] as const;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Dropdown Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-green-600 hover:bg-green-50 transition-all bg-white text-gray-700"
      >
        <Globe className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium">{currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase">Select Language</p>
          </div>

          {/* Language Options */}
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as 'en' | 'hi' | 'mr');
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  language === lang.code
                    ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                    : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-xs text-gray-500">{lang.nativeName}</span>
                </div>
                {language === lang.code && (
                  <span className="ml-auto">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">Language will change instantly</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

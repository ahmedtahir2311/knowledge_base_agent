import { useState } from "react";

interface LangToogleProps {
  onChange?: (language: string) => void;
  className?: string;
  languageContext: string;
}

export const LangToogle = ({
  languageContext,
  onChange,
  className = "",
}: LangToogleProps) => {
  const [language, setLanguage] = useState<string>(languageContext || "en");

  const handleToggle = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
    if (onChange) {
      onChange(newLanguage);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-7 w-14 items-center rounded-full bg-secondary p-0.5 shadow-inner ${className}`}
      role='switch'
      aria-checked={language === "ar"}
      aria-label={`Switch to ${language === "en" ? "Arabic" : "English"}`}
    >
      <span className='sr-only'>
        {language === "en" ? "English" : "العربية"}
      </span>

      {/* Sliding indicator */}
      <span
        className={`absolute z-10 flex h-6 w-6 transform items-center justify-center rounded-full bg-cta text-xs font-medium text-white shadow-md transition-all duration-600 ease-in-out ${
          language === "ar" ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {language === "en" ? "EN" : "AR"}
      </span>

      {/* Background text labels */}
      <div className='flex h-full w-full items-center justify-between px-1.5 text-xs'>
        <span
          className={`ml-0.5 font-medium transition-opacity duration-600 ${
            language === "en" ? "opacity-0" : "opacity-100 text-white"
          }`}
        >
          EN
        </span>
        <span
          className={`mr-0.5 font-medium transition-opacity duration-600 ${
            language === "ar" ? "opacity-0" : "opacity-100 text-white"
          }`}
        >
          AR
        </span>
      </div>
    </button>
  );
};

export default LangToogle;

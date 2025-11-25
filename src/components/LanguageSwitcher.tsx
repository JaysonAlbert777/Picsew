import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language?.startsWith("zh") ? "en" : "zh";
    i18n.changeLanguage(nextLang);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className=""
      onClick={toggleLanguage}
      title={
        i18n.language?.startsWith("zh") ? "Switch to English" : "切换到中文"
      }
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {i18n.language?.startsWith("zh") ? "Switch to English" : "切换到中文"}
      </span>
    </Button>
  );
}

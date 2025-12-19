import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-background/50 border-t border-border backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" />
            <span>{t("footerCopyright")}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t("termsOfService")}
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t("privacyPolicy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
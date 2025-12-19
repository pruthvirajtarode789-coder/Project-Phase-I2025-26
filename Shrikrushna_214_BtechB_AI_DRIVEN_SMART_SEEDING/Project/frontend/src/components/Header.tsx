import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-soft">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Ag</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground">{t('title')}</span>
            <span className="text-xs text-muted-foreground">{t('subtitle')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'मराठी'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('hi')}>
                हिंदी (Hindi)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('mr')}>
                मराठी (Marathi)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/login">
            <Button variant="default" size="sm">
              {t('login')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Leaf, Bell } from "lucide-react";

const LiveSections = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="container px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-accent shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Sun className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">{t('liveWeather')}</CardTitle>
              </div>
              <CardDescription>{t('liveWeatherDesc')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-primary shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t('cropAdvisor')}</CardTitle>
              </div>
              <CardDescription>{t('cropAdvisorDesc')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-secondary shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Bell className="h-5 w-5 text-secondary" />
                <CardTitle className="text-lg">{t('tipsAlerts')}</CardTitle>
              </div>
              <CardDescription>{t('tipsAlertsDesc')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LiveSections;

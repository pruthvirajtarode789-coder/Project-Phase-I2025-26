import { useLanguage } from "@/contexts/LanguageContext";
import FeatureCard from "./FeatureCard";
import { Cloud, Sprout, Calculator } from "lucide-react";

const MainFeatures = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={Cloud}
            title={t('predictWeather')}
            description={t('predictWeatherDesc')}
            gradient="bg-accent"
          />
          <FeatureCard
            icon={Sprout}
            title={t('predictCrop')}
            description={t('predictCropDesc')}
            gradient="bg-primary"
          />
          <FeatureCard
            icon={Calculator}
            title={t('predictSeedRate')}
            description={t('predictSeedRateDesc')}
            gradient="bg-secondary"
          />
        </div>
      </div>
    </section>
  );
};

export default MainFeatures;

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import weatherImage from "@/assets/weather-feature.jpg";
import cropImage from "@/assets/crop-feature.jpg";
import seedImage from "@/assets/seed-feature.jpg";

const DetailedFeatures = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container px-4">
        <div className="grid gap-12 lg:gap-16">
          {/* Weather Intelligence */}
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={weatherImage} 
                alt="Weather Intelligence" 
                className="rounded-xl shadow-elevated w-full h-auto animate-float"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                {t('weatherIntelligence')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('weatherIntelligenceDesc')}
              </p>
            </div>
          </div>

          {/* Crop Suitability */}
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                {t('cropSuitability')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('cropSuitabilityDesc')}
              </p>
            </div>
            <div>
              <img 
                src={cropImage} 
                alt="Crop Suitability" 
                className="rounded-xl shadow-elevated w-full h-auto animate-float"
                style={{ animationDelay: '1s' }}
              />
            </div>
          </div>

          {/* Seed Rate Calculator */}
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={seedImage} 
                alt="Seed Rate Calculator" 
                className="rounded-xl shadow-elevated w-full h-auto animate-float"
                style={{ animationDelay: '2s' }}
              />
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                {t('seedRateCalculator')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('seedRateCalculatorDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailedFeatures;

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // User is logged in, go to dashboard/prediction page
      navigate('/dashboard');
    } else {
      // User is not logged in, go to login/registration page
      navigate('/login');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 sm:py-28">
      <div className="absolute inset-0 opacity-10">
        <img 
          src={heroImage} 
          alt="Farm landscape" 
          className="h-full w-full object-cover"
        />
      </div>
      
      <div className="container relative z-10 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
          <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mb-8 text-lg text-white/90 sm:text-xl">
            {t('heroDescription')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="group bg-white text-primary hover:bg-white/90 shadow-elevated"
            >
              {t('getStarted')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur"
            >
              {t('explore')}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;

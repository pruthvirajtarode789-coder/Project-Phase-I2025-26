import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, MailCheck } from "lucide-react";

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd call an API to send the reset email.
    console.log("Password reset requested for:", email);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-elegant p-8 lg:p-12 border border-border animate-fade-in">
          {submitted ? (
            <div className="text-center">
              <MailCheck className="mx-auto h-12 w-12 text-primary mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {t('resetLinkSent')}
              </h1>
              <p className="text-muted-foreground mb-6">
                {`We've sent a password reset link to ${email}`}
              </p>
              <Button asChild className="w-full">
                <Link to="/login">{t('backToLogin')}</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {t('forgotPasswordTitle')}
                </h1>
                <p className="text-muted-foreground">
                  {t('forgotPasswordDescription')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  {t('sendResetLink')}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Button variant="link" asChild className="p-0 h-auto font-semibold gap-2">
                  <Link to="/login"><ArrowLeft className="h-4 w-4" />{t('backToLogin')}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
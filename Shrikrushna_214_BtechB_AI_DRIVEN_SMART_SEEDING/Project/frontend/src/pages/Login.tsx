import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import loginImage from "../assets/login-farmer.jpg";
import signupImage from "../assets/signup-farmer.png"; // Add your signup image here
import farmBackground from "../assets/background.jpg"; // Add your background image here

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numeric digits and limit to 10 characters
    const numericValue = value.replace(/\D/g, "");
    setPhoneNumber(numericValue.slice(0, 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_URL = "http://localhost:5000/api/auth";

    if (!isLogin) {
      // Sign-up validation
      const indianPhoneNumberRegex = /^[6-9]\d{9}$/;
      if (!indianPhoneNumberRegex.test(phoneNumber)) {
        return toast.error("Please enter a valid 10-digit Indian phone number.");
      }
      try {
        const response = await fetch(`${API_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, phoneNumber }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');
        
        toast.success(data.message);
        setIsLogin(true); // Flip to login form after successful signup
      } catch (error: any) {
        toast.error(error.message);
      }
    } else {
      // Login logic
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');

        // In a real app, save the token and redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', email.split('@')[0]); // Extract name from email
        toast.success("Login successful!");
        navigate("/dashboard"); // Navigate to dashboard page
      } catch (error: any) {
        toast.error(error.message);
        return;
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      <img
        src={farmBackground}
        alt="Farm background"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToHome')}
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Image Section */}
          <div className="hidden lg:block [perspective:1000px]">
            <div
              className={`relative w-full h-full rounded-2xl shadow-elegant transition-transform duration-700 [transform-style:preserve-3d] ${
                !isLogin ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* Front side of the card */}
              <img src={loginImage} alt={t("loginDescription")} className="w-full h-full object-cover rounded-2xl [backface-visibility:hidden]" />
              {/* Back side of the card */}
              <img
                src={signupImage} alt={t("signupDescription")}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="[perspective:1000px]">
            <div
              className={`relative transition-transform duration-700 [transform-style:preserve-3d] ${
                !isLogin ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* Login Form (Front Face) */}
              <div className="bg-card rounded-2xl shadow-elegant p-8 lg:p-12 border border-border [backface-visibility:hidden]">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {t('welcomeBack')}
                  </h1>
                  <p className="text-muted-foreground">
                    {t('loginDescription')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('email')}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('password')}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      {t('rememberMe')}
                    </label>
                    <Button asChild variant="link" className="p-0 h-auto text-primary">
                      <Link to="/forgot-password">{t('forgotPassword')}</Link>
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    {t('login')}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('noAccount')}{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      onClick={() => setIsLogin(false)}
                    >
                      {t('signup')}
                    </Button>
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground">
                    {t('loginFooter')}
                  </p>
                </div>
              </div>

              {/* Signup Form (Back Face) */}
              <div className="absolute top-0 left-0 w-full h-full bg-card rounded-2xl shadow-elegant p-8 lg:p-12 border border-border [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {t('createAccount')}
                  </h1>
                  <p className="text-muted-foreground">
                    {t('signupDescription')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">{t('phoneNumber')}</Label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-background text-sm text-muted-foreground">
                        +91
                      </span>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder={t('phoneNumberPlaceholder')}
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        required
                        className="bg-background rounded-l-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    {t('signup')}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('haveAccount')}{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      onClick={() => setIsLogin(true)}
                    >
                      {t('login')}
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

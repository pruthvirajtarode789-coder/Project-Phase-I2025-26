import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
}

const FeatureCard = ({ icon: Icon, title, description, gradient = "bg-primary" }: FeatureCardProps) => {
  return (
    <Card className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50">
      <CardHeader>
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${gradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default FeatureCard;

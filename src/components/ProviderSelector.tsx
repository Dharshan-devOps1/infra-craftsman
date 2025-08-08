import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Zap } from "lucide-react";

export interface CloudProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const providers: CloudProvider[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    icon: <Cloud className="h-8 w-8" />,
    description: "Most comprehensive cloud platform with 200+ services",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    icon: <CloudRain className="h-8 w-8" />,
    description: "Enterprise-grade cloud with strong hybrid capabilities",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    icon: <Zap className="h-8 w-8" />,
    description: "AI/ML focused platform with cutting-edge technologies",
    color: "bg-green-500/10 text-green-400 border-green-500/20"
  }
];

interface ProviderSelectorProps {
  selectedProvider: string | null;
  onProviderChange: (providerId: string) => void;
}

export function ProviderSelector({ selectedProvider, onProviderChange }: ProviderSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Choose Your Cloud Provider
        </h2>
        <p className="text-muted-foreground mt-2">
          Select the cloud platform for your Terraform infrastructure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card ${
              selectedProvider === provider.id 
                ? "ring-2 ring-primary shadow-glow" 
                : "hover:scale-105"
            }`}
            onClick={() => onProviderChange(provider.id)}
          >
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className={`p-4 rounded-full ${provider.color}`}>
                  {provider.icon}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold">{provider.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {provider.description}
                </p>
              </div>

              {selectedProvider === provider.id && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Selected
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
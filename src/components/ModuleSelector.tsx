import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export interface TerraformModule {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: ModuleParameter[];
}

export interface ModuleParameter {
  name: string;
  type: "string" | "number" | "boolean" | "list";
  description: string;
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

import { Network, Server, Database, Shield, Users, Activity, Eye } from "lucide-react";

const moduleCategories = [
  {
    id: "networking",
    name: "Networking",
    icon: <Network className="h-5 w-5" />,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  {
    id: "compute",
    name: "Compute", 
    icon: <Server className="h-5 w-5" />,
    color: "bg-green-500/10 text-green-400 border-green-500/20"
  },
  {
    id: "storage",
    name: "Storage",
    icon: <Database className="h-5 w-5" />,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  },
  {
    id: "database",
    name: "Database",
    icon: <Database className="h-5 w-5" />,
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  },
  {
    id: "security",
    name: "Security",
    icon: <Shield className="h-5 w-5" />,
    color: "bg-red-500/10 text-red-400 border-red-500/20"
  },
  {
    id: "identity",
    name: "Identity & Access",
    icon: <Users className="h-5 w-5" />,
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
  },
  {
    id: "monitoring",
    name: "Monitoring & Logging",
    icon: <Activity className="h-5 w-5" />,
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
  }
];

import { awsModules, azureModules, gcpModules } from "@/data/modules";

interface ModuleSelectorProps {
  provider: string;
  selectedModules: string[];
  onModuleToggle: (moduleId: string) => void;
}

export function ModuleSelector({ provider, selectedModules, onModuleToggle }: ModuleSelectorProps) {
  const getModules = () => {
    switch (provider) {
      case "aws": return awsModules;
      case "azure": return azureModules;
      case "gcp": return gcpModules;
      default: return [];
    }
  };
  
  const modules = getModules();

  const getModulesByCategory = (categoryId: string) => {
    return modules.filter(module => module.category === categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Select Terraform Modules
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose the infrastructure components you need
        </p>
      </div>

      <div className="space-y-6">
        {moduleCategories.map((category) => {
          const categoryModules = getModulesByCategory(category.id);
          if (categoryModules.length === 0) return null;

          return (
            <Card key={category.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-md ${category.color}`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {categoryModules.length} modules
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryModules.map((module) => (
                    <div
                      key={module.id}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        selectedModules.includes(module.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => onModuleToggle(module.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedModules.includes(module.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.description}
                          </p>
                          <div className="flex gap-1 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {module.parameters.length} params
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


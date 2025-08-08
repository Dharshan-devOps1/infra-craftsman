import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TerraformModule } from "./ModuleSelector";
import { awsModules, azureModules, gcpModules } from "@/data/modules";

interface ParameterFormProps {
  provider: string;
  selectedModules: string[];
  parameters: Record<string, Record<string, string>>;
  onParameterChange: (moduleId: string, paramName: string, value: string) => void;
}

export function ParameterForm({ provider, selectedModules, parameters, onParameterChange }: ParameterFormProps) {
  const getModules = () => {
    switch (provider) {
      case "aws": return awsModules;
      case "azure": return azureModules; 
      case "gcp": return gcpModules;
      default: return [];
    }
  };
  
  const modules = getModules();
  const selectedModuleData = modules.filter(module => selectedModules.includes(module.id));

  if (selectedModuleData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Configure Parameters
        </h2>
        <p className="text-muted-foreground mt-2">
          Set the configuration values for your selected modules
        </p>
      </div>

      <div className="space-y-6">
        {selectedModuleData.map((module) => (
          <Card key={module.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-semibold">{module.name}</h3>
                <Badge variant="outline">{module.category}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {module.parameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={`${module.id}-${param.name}`}>
                      {param.name}
                      {param.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    
                    {param.type === "string" && !param.options && (
                      <Input
                        id={`${module.id}-${param.name}`}
                        placeholder={param.defaultValue}
                        value={parameters[module.id]?.[param.name] || param.defaultValue || ""}
                        onChange={(e) => onParameterChange(module.id, param.name, e.target.value)}
                      />
                    )}

                    {param.type === "string" && param.options && (
                      <Select
                        value={parameters[module.id]?.[param.name] || param.defaultValue}
                        onValueChange={(value) => onParameterChange(module.id, param.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {param.type === "number" && (
                      <Input
                        id={`${module.id}-${param.name}`}
                        type="number"
                        placeholder={param.defaultValue}
                        value={parameters[module.id]?.[param.name] || param.defaultValue || ""}
                        onChange={(e) => onParameterChange(module.id, param.name, e.target.value)}
                      />
                    )}

                    {param.type === "boolean" && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${module.id}-${param.name}`}
                          checked={parameters[module.id]?.[param.name] === "true" || param.defaultValue === "true"}
                          onCheckedChange={(checked) => 
                            onParameterChange(module.id, param.name, checked ? "true" : "false")
                          }
                        />
                        <Label htmlFor={`${module.id}-${param.name}`} className="text-sm">
                          Enable
                        </Label>
                      </div>
                    )}

                    {param.type === "list" && (
                      <Input
                        id={`${module.id}-${param.name}`}
                        placeholder={param.defaultValue}
                        value={parameters[module.id]?.[param.name] || param.defaultValue || ""}
                        onChange={(e) => onParameterChange(module.id, param.name, e.target.value)}
                      />
                    )}

                    <p className="text-xs text-muted-foreground">
                      {param.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
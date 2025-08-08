import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProviderSelector } from "@/components/ProviderSelector";
import { ModuleSelector } from "@/components/ModuleSelector";
import { ParameterForm } from "@/components/ParameterForm";
import { generateTerraformProject } from "@/utils/terraformGenerator";
import { useToast } from "@/hooks/use-toast";
import { Download, Code, Zap, Shield, CheckCircle } from "lucide-react";

type Step = "provider" | "modules" | "parameters" | "generate";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("provider");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [parameters, setParameters] = useState<Record<string, Record<string, string>>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: "provider", name: "Provider", description: "Choose cloud platform" },
    { id: "modules", name: "Modules", description: "Select components" },
    { id: "parameters", name: "Configure", description: "Set parameters" },
    { id: "generate", name: "Generate", description: "Download project" }
  ];

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setSelectedModules([]);
    setParameters({});
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleParameterChange = (moduleId: string, paramName: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [paramName]: value
      }
    }));
  };

  const handleGenerate = async () => {
    if (!selectedProvider || selectedModules.length === 0) {
      toast({
        title: "Missing Configuration",
        description: "Please select a provider and at least one module.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateTerraformProject({
        provider: selectedProvider,
        selectedModules,
        parameters
      });
      
      toast({
        title: "Project Generated!",
        description: "Your Terraform project has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceedToModules = selectedProvider !== null;
  const canProceedToParameters = selectedModules.length > 0;
  const canGenerate = selectedProvider && selectedModules.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-secondary">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center space-y-6">
              <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
                Infrastructure as Code Generator
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Terraform Project
                <br />
                Generator
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Generate production-ready Terraform configurations for AWS, Azure, and GCP. 
                Select your modules, configure parameters, and download a complete project structure.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 pt-8">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <span className="text-sm">Clean Code Structure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-sm">Ready to Deploy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">Best Practices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                    currentStep === step.id 
                      ? "bg-primary text-primary-foreground shadow-glow" 
                      : steps.findIndex(s => s.id === currentStep) > index
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {steps.findIndex(s => s.id === currentStep) > index ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="font-medium text-sm">{step.name}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <Separator className="mx-8 w-20" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        {currentStep === "provider" && (
          <div className="space-y-8">
            <ProviderSelector
              selectedProvider={selectedProvider}
              onProviderChange={handleProviderChange}
            />
            
            <div className="text-center">
              <Button
                variant="gradient"
                size="lg"
                disabled={!canProceedToModules}
                onClick={() => setCurrentStep("modules")}
                className="animate-pulse-glow"
              >
                Continue to Modules
              </Button>
            </div>
          </div>
        )}

        {currentStep === "modules" && selectedProvider && (
          <div className="space-y-8">
            <ModuleSelector
              provider={selectedProvider}
              selectedModules={selectedModules}
              onModuleToggle={handleModuleToggle}
            />
            
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("provider")}
              >
                Back to Provider
              </Button>
              <Button
                variant="gradient"
                size="lg"
                disabled={!canProceedToParameters}
                onClick={() => setCurrentStep("parameters")}
              >
                Configure Parameters
              </Button>
            </div>
          </div>
        )}

        {currentStep === "parameters" && selectedProvider && (
          <div className="space-y-8">
            <ParameterForm
              provider={selectedProvider}
              selectedModules={selectedModules}
              parameters={parameters}
              onParameterChange={handleParameterChange}
            />
            
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("modules")}
              >
                Back to Modules
              </Button>
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setCurrentStep("generate")}
              >
                Ready to Generate
              </Button>
            </div>
          </div>
        )}

        {currentStep === "generate" && (
          <div className="space-y-8">
            <Card className="p-8 text-center shadow-elegant">
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Download className="h-10 w-10 text-primary-foreground" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-2">Ready to Generate</h2>
                  <p className="text-muted-foreground">
                    Your Terraform project will include all selected modules with proper configuration
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Provider</p>
                      <p className="text-muted-foreground capitalize">{selectedProvider}</p>
                    </div>
                    <div>
                      <p className="font-medium">Modules</p>
                      <p className="text-muted-foreground">{selectedModules.length} selected</p>
                    </div>
                    <div>
                      <p className="font-medium">Structure</p>
                      <p className="text-muted-foreground">Production ready</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("parameters")}
                  >
                    Back to Configure
                  </Button>
                  <Button
                    variant="generate"
                    size="lg"
                    disabled={!canGenerate || isGenerating}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? "Generating..." : "Download Project"}
                    <Download className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
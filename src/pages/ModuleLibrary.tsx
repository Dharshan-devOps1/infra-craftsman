import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Filter,
  Network, 
  Server, 
  Database, 
  Shield, 
  Users, 
  Activity,
  Code,
  Copy,
  ExternalLink,
  Cloud
} from "lucide-react";
import { awsModules, azureModules, gcpModules } from "@/data/modules";

const allModules = [
  ...awsModules.map(m => ({ ...m, provider: "AWS" })),
  ...azureModules.map(m => ({ ...m, provider: "Azure" })),
  ...gcpModules.map(m => ({ ...m, provider: "GCP" }))
];

const categoryIcons = {
  networking: Network,
  compute: Server,
  storage: Database,
  database: Database,
  security: Shield,
  identity: Users,
  monitoring: Activity
};

const categoryColors = {
  networking: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  compute: "bg-green-500/10 text-green-500 border-green-500/20",
  storage: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  database: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  security: "bg-red-500/10 text-red-500 border-red-500/20",
  identity: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  monitoring: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
};

export default function ModuleLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("grid");

  const filteredModules = useMemo(() => {
    return allModules.filter(module => {
      const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvider = selectedProvider === "all" || module.provider === selectedProvider;
      const matchesCategory = selectedCategory === "all" || module.category === selectedCategory;
      
      return matchesSearch && matchesProvider && matchesCategory;
    });
  }, [searchTerm, selectedProvider, selectedCategory]);

  const categories = [...new Set(allModules.map(m => m.category))];
  const providers = ["AWS", "Azure", "GCP"];

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category as keyof typeof categoryIcons] || Code;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "AWS": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Azure": return "bg-blue-500/10 text-blue-500 border-blue-500/20";  
      case "GCP": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const generateExampleCode = (module: any) => {
    return `# ${module.name} Example
resource "${module.provider.toLowerCase()}_${module.id}" "example" {
${module.parameters.slice(0, 3).map((param: any) => 
  `  ${param.name} = ${param.type === "string" ? `"${param.defaultValue || "example"}"` : param.defaultValue || "true"}`
).join('\n')}
  
  tags = {
    Name        = "${module.name} Example"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ModuleCard = ({ module }: { module: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(module.category)}
            <CardTitle className="text-lg">{module.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getCategoryColor(module.category)}>
              {module.category}
            </Badge>
            <Badge className={getProviderColor(module.provider)}>
              {module.provider}
            </Badge>
          </div>
        </div>
        <CardDescription>{module.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Parameters Preview */}
          <div>
            <h4 className="text-sm font-medium mb-2">Parameters ({module.parameters.length})</h4>
            <div className="space-y-1">
              {module.parameters.slice(0, 3).map((param: any) => (
                <div key={param.name} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{param.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {param.type}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </Badge>
                </div>
              ))}
              {module.parameters.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{module.parameters.length - 3} more parameters
                </p>
              )}
            </div>
          </div>

          {/* Example Code */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Example Usage</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(generateExampleCode(module))}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="bg-muted rounded-md p-3 text-xs font-mono">
              <pre className="whitespace-pre-wrap">
                {generateExampleCode(module).split('\n').slice(0, 4).join('\n')}
                {generateExampleCode(module).split('\n').length > 4 && '\n  ...'}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button size="sm" className="flex-1">
              <Code className="h-3 w-3 mr-1" />
              Use Module
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Terraform Module Library
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover and explore production-ready Terraform modules for AWS, Azure, and GCP.
            Copy examples, learn best practices, and accelerate your infrastructure deployment.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Cloud className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredModules.length} of {allModules.length} modules
              </p>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Modules Display */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module, index) => (
                <ModuleCard key={`${module.provider}-${module.id}-${index}`} module={module} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {filteredModules.map((module, index) => (
                    <div key={`${module.provider}-${module.id}-${index}`} className="p-6 border-b last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getCategoryIcon(module.category)}
                            <h3 className="text-lg font-medium">{module.name}</h3>
                            <Badge className={getCategoryColor(module.category)}>
                              {module.category}
                            </Badge>
                            <Badge className={getProviderColor(module.provider)}>
                              {module.provider}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{module.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{module.parameters.length} parameters</span>
                            <span>•</span>
                            <span>{module.parameters.filter((p: any) => p.required).length} required</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Docs
                          </Button>
                          <Button size="sm">
                            <Code className="h-3 w-3 mr-1" />
                            Use Module
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No modules found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setSelectedProvider("all");
                setSelectedCategory("all");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  GitBranch,
  Download,
  Settings,
  Eye,
  Activity,
  FileText,
  Terminal,
  Cloud,
  Server,
  Database,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

// Mock project data
const projectData = {
  id: "1",
  name: "Production Infrastructure",
  description: "Main production environment with load balancers, auto-scaling groups, and RDS",
  provider: "AWS",
  status: "deployed",
  createdAt: "2024-01-15",
  lastDeployed: "2 hours ago",
  githubRepo: "https://github.com/user/production-infra",
  cost: "$456/month",
  modules: [
    {
      id: "vpc",
      name: "VPC",
      category: "networking",
      status: "deployed",
      resources: 5
    },
    {
      id: "ec2",
      name: "EC2 Instances", 
      category: "compute",
      status: "deployed",
      resources: 3
    },
    {
      id: "rds",
      name: "RDS Database",
      category: "database", 
      status: "deployed",
      resources: 2
    },
    {
      id: "alb",
      name: "Application Load Balancer",
      category: "networking",
      status: "deployed", 
      resources: 1
    }
  ],
  parameters: {
    vpc: {
      vpc_cidr: "10.0.0.0/16",
      enable_dns_hostnames: "true"
    },
    ec2: {
      instance_type: "t3.medium",
      instance_count: "3"
    },
    rds: {
      engine: "mysql",
      instance_class: "db.t3.micro"
    }
  },
  deploymentLogs: [
    {
      timestamp: "2024-01-20T10:30:00Z",
      level: "info",
      message: "Starting Terraform apply operation"
    },
    {
      timestamp: "2024-01-20T10:30:15Z", 
      level: "info",
      message: "aws_vpc.main: Creating..."
    },
    {
      timestamp: "2024-01-20T10:30:45Z",
      level: "info", 
      message: "aws_vpc.main: Creation complete after 30s"
    },
    {
      timestamp: "2024-01-20T10:31:00Z",
      level: "info",
      message: "aws_subnet.public: Creating..."
    },
    {
      timestamp: "2024-01-20T10:32:30Z",
      level: "success",
      message: "Apply complete! Resources: 11 added, 0 changed, 0 destroyed."
    }
  ],
  planOutput: `
Terraform will perform the following actions:

  # aws_instance.web[0] will be created
  + resource "aws_instance" "web" {
      + ami                                  = "ami-0c02fb55956c7d316"
      + instance_type                        = "t3.medium"
      + key_name                             = "my-key"
      + vpc_security_group_ids               = (known after apply)
      
      + root_block_device {
          + volume_size = 20
          + volume_type = "gp3"
        }
    }

  # aws_security_group.web will be created
  + resource "aws_security_group" "web" {
      + name_prefix = "web-"
      + vpc_id      = (known after apply)
      
      + ingress {
          + from_port   = 80
          + to_port     = 80
          + protocol    = "tcp"
          + cidr_blocks = ["0.0.0.0/0"]
        }
    }

Plan: 2 to add, 0 to change, 0 to destroy.
  `
};

export default function ProjectDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeploying, setIsDeploying] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "networking": return <Cloud className="h-4 w-4" />;
      case "compute": return <Server className="h-4 w-4" />;
      case "database": return <Database className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const handleTerraformAction = (action: string) => {
    setIsDeploying(true);
    // Simulate terraform operation
    setTimeout(() => {
      setIsDeploying(false);
    }, 3000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{projectData.name}</h1>
              <p className="text-muted-foreground">{projectData.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              {projectData.status}
            </Badge>
            <Button variant="outline" size="sm">
              <GitBranch className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>

        {/* Project Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="font-medium">{projectData.provider}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Modules</p>
                  <p className="font-medium">{projectData.modules.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="font-medium">{projectData.cost}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Deploy</p>
                  <p className="font-medium">{projectData.lastDeployed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terraform Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Terraform Operations</CardTitle>
            <CardDescription>
              Run Terraform commands to manage your infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => handleTerraformAction("plan")}
                disabled={isDeploying}
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                terraform plan
              </Button>
              <Button 
                onClick={() => handleTerraformAction("apply")}
                disabled={isDeploying}
              >
                <Play className="h-4 w-4 mr-2" />
                terraform apply
              </Button>
              <Button 
                onClick={() => handleTerraformAction("destroy")}
                disabled={isDeploying}
                variant="destructive"
              >
                <Square className="h-4 w-4 mr-2" />
                terraform destroy
              </Button>
              <Button 
                variant="outline"
                disabled={isDeploying}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Config
              </Button>
            </div>
            {isDeploying && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm">Running terraform operation...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="logs">Deployment Logs</TabsTrigger>
            <TabsTrigger value="plan">Terraform Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(projectData.parameters).map(([moduleId, params]) => (
                    <div key={moduleId}>
                      <h4 className="font-medium capitalize mb-2">{moduleId} Configuration</h4>
                      <div className="space-y-1">
                        {Object.entries(params).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{projectData.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Deployed:</span>
                      <span>{projectData.lastDeployed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GitHub Repo:</span>
                      <a href={projectData.githubRepo} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        View Repository
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        {projectData.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Modules</CardTitle>
                <CardDescription>
                  Modules deployed in this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectData.modules.map((module) => (
                    <div key={module.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(module.category)}
                          <h4 className="font-medium">{module.name}</h4>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          {module.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Category: {module.category}</p>
                        <p>Resources: {module.resources}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Logs</CardTitle>
                <CardDescription>
                  Real-time logs from your latest deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-background">
                  <div className="space-y-1 font-mono text-sm">
                    {projectData.deploymentLogs.map((log, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-muted-foreground text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-xs ${
                          log.level === "error" ? "text-red-500" :
                          log.level === "success" ? "text-green-500" :
                          log.level === "warning" ? "text-yellow-500" :
                          "text-foreground"
                        }`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="text-xs">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Terraform Plan Output</CardTitle>
                <CardDescription>
                  Preview of infrastructure changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-background">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {projectData.planOutput}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
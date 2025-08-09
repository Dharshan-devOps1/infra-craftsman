import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Server, 
  Database, 
  Cloud, 
  Plus, 
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const stats = [
  {
    title: "Total Projects",
    value: "12",
    change: "+2 this month",
    icon: Server,
    color: "text-blue-500"
  },
  {
    title: "Active Deployments", 
    value: "8",
    change: "75% success rate",
    icon: Activity,
    color: "text-green-500"
  },
  {
    title: "Resources Managed",
    value: "156",
    change: "+23 this week",
    icon: Database,
    color: "text-purple-500"
  },
  {
    title: "Monthly Cost",
    value: "$1,247",
    change: "-12% vs last month",
    icon: DollarSign,
    color: "text-orange-500"
  }
];

const recentProjects = [
  {
    id: "1",
    name: "Production Infrastructure",
    provider: "AWS",
    status: "deployed",
    lastDeployment: "2 hours ago",
    modules: 8,
    cost: "$456/mo"
  },
  {
    id: "2", 
    name: "Staging Environment",
    provider: "Azure",
    status: "deploying",
    lastDeployment: "5 minutes ago",
    modules: 5,
    cost: "$123/mo"
  },
  {
    id: "3",
    name: "Development Cluster",
    provider: "GCP",
    status: "failed",
    lastDeployment: "1 day ago", 
    modules: 12,
    cost: "$89/mo"
  },
  {
    id: "4",
    name: "Analytics Pipeline",
    provider: "AWS",
    status: "pending",
    lastDeployment: "3 days ago",
    modules: 6,
    cost: "$234/mo"
  }
];

const recentActivity = [
  {
    action: "Deployed",
    project: "Production Infrastructure",
    time: "2 hours ago",
    status: "success"
  },
  {
    action: "Plan generated",
    project: "Staging Environment", 
    time: "4 hours ago",
    status: "info"
  },
  {
    action: "Deployment failed",
    project: "Development Cluster",
    time: "1 day ago",
    status: "error"
  },
  {
    action: "Project created",
    project: "Analytics Pipeline",
    time: "3 days ago",
    status: "info"
  }
];

const providerUsage = [
  { provider: "AWS", projects: 7, percentage: 58 },
  { provider: "Azure", projects: 3, percentage: 25 },
  { provider: "GCP", projects: 2, percentage: 17 }
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "deployed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "deploying": return <Clock className="h-4 w-4 text-blue-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "deploying": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor your infrastructure projects and deployments
            </p>
          </div>
          <Button asChild>
            <Link to="/">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your latest infrastructure projects and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(project.status)}
                          <div>
                            <Link 
                              to={`/project/${project.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {project.name}
                            </Link>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Cloud className="h-3 w-3" />
                              <span>{project.provider}</span>
                              <span>•</span>
                              <span>{project.modules} modules</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {project.lastDeployment}
                        </div>
                        <div className="text-sm font-medium">
                          {project.cost}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Projects
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Cloud Provider Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {providerUsage.map((provider) => (
                  <div key={provider.provider} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{provider.provider}</span>
                      <span>{provider.projects} projects</span>
                    </div>
                    <Progress value={provider.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`mt-1 h-2 w-2 rounded-full ${
                        activity.status === "success" ? "bg-green-500" :
                        activity.status === "error" ? "bg-red-500" : "bg-blue-500"
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span>{" "}
                          <span className="text-muted-foreground">{activity.project}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <GitBranch className="mr-2 h-4 w-4" />
                  Connect GitHub
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/modules">
                    <Database className="mr-2 h-4 w-4" />
                    Browse Modules
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
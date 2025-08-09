import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings, 
  Key, 
  Github, 
  Moon, 
  Sun, 
  Save,
  Upload,
  Trash2,
  Shield,
  Bell,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const userData = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  avatarUrl: "/placeholder-avatar.jpg",
  githubUsername: "johndoe",
  createdAt: "2024-01-15",
  projects: 12,
  deployments: 47,
  settings: {
    notifications: {
      deploymentSuccess: true,
      deploymentFailure: true,
      weeklyReport: false,
      securityAlerts: true
    },
    theme: "dark",
    timezone: "America/New_York"
  }
};

const integrations = [
  {
    id: "github",
    name: "GitHub",
    description: "Connect your GitHub account for repository integration",
    icon: Github,
    connected: true,
    username: "johndoe"
  },
  {
    id: "aws",
    name: "AWS",
    description: "AWS credentials for infrastructure deployment",
    icon: Shield,
    connected: false,
    username: null
  },
  {
    id: "azure",
    name: "Microsoft Azure", 
    description: "Azure credentials for infrastructure deployment",
    icon: Shield,
    connected: false,
    username: null
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    description: "GCP credentials for infrastructure deployment",
    icon: Shield,
    connected: false,
    username: null
  }
];

const recentActivity = [
  {
    action: "Updated profile information",
    timestamp: "2 hours ago"
  },
  {
    action: "Connected GitHub account",
    timestamp: "1 day ago"
  },
  {
    action: "Changed notification settings",
    timestamp: "3 days ago"
  },
  {
    action: "Enabled two-factor authentication",
    timestamp: "1 week ago"
  }
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    githubUsername: userData.githubUsername
  });
  const [notifications, setNotifications] = useState(userData.settings.notifications);
  const [theme, setTheme] = useState(userData.settings.theme);
  const { toast } = useToast();

  const handleSave = () => {
    // Simulate API call
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleIntegrationToggle = (integrationId: string) => {
    toast({
      title: "Integration updated",
      description: `${integrationId} integration has been updated.`,
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userData.avatarUrl} alt={userData.name} />
            <AvatarFallback className="text-2xl">
              {userData.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{userData.name}</h1>
            <p className="text-muted-foreground">{userData.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="outline">{userData.projects} projects</Badge>
              <Badge variant="outline">{userData.deployments} deployments</Badge>
              <Badge variant="outline">Member since {new Date(userData.createdAt).getFullYear()}</Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{userData.projects}</p>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{userData.deployments}</p>
                  <p className="text-sm text-muted-foreground">Deployments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Connected Services</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </div>
                  <Button 
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                    <AvatarFallback className="text-2xl">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub Username</Label>
                    <Input
                      id="github"
                      value={formData.githubUsername}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUsername: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Theme Settings */}
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">Appearance</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred theme
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>
                  Manage your third-party integrations and API connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {integrations.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                          {integration.connected && integration.username && (
                            <p className="text-xs text-green-600">Connected as @{integration.username}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={integration.connected ? 
                          "bg-green-500/10 text-green-500 border-green-500/20" : 
                          "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }>
                          {integration.connected ? "Connected" : "Not connected"}
                        </Badge>
                        <Button 
                          variant={integration.connected ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleIntegrationToggle(integration.id)}
                        >
                          {integration.connected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Deployment Success</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified when deployments complete successfully
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.deploymentSuccess}
                      onCheckedChange={(checked) => handleNotificationChange("deploymentSuccess", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Deployment Failures</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified when deployments fail
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.deploymentFailure}
                      onCheckedChange={(checked) => handleNotificationChange("deploymentFailure", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly summary of your projects
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => handleNotificationChange("weeklyReport", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Security Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Important security notifications and alerts
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("securityAlerts", checked)}
                    />
                  </div>
                </div>

                <Button onClick={() => toast({ title: "Settings saved", description: "Your notification preferences have been updated." })}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent account and project activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
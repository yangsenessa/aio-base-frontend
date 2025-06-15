
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Server, Zap, TrendingUp, Activity, Bot } from 'lucide-react';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'AIO-2030 | Dashboard';
  }, []);

  const stats = [
    {
      title: "Active Agents",
      value: "23",
      change: "+12%",
      icon: Bot,
      description: "Agents currently running"
    },
    {
      title: "MCP Servers",
      value: "8",
      change: "+5%",
      icon: Server,
      description: "Connected MCP servers"
    },
    {
      title: "Total Users",
      value: "156",
      change: "+23%",
      icon: Users,
      description: "Registered users"
    },
    {
      title: "API Calls",
      value: "2.4k",
      change: "+15%",
      icon: Activity,
      description: "Today's API requests"
    }
  ];

  const recentActivity = [
    {
      type: "Agent",
      name: "GPT-4 Assistant",
      status: "Active",
      time: "2 minutes ago"
    },
    {
      type: "MCP",
      name: "File Handler",
      status: "Connected",
      time: "5 minutes ago"
    },
    {
      type: "Agent",
      name: "Code Analyzer",
      status: "Pending",
      time: "10 minutes ago"
    },
    {
      type: "MCP",
      name: "Database Connector",
      status: "Active",
      time: "15 minutes ago"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your AIO-2030 ecosystem and recent activity
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-600">{stat.change}</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your agents and MCP servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'Active' ? 'bg-green-500' :
                      activity.status === 'Connected' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">{activity.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      activity.status === 'Active' ? 'default' :
                      activity.status === 'Connected' ? 'secondary' : 'outline'
                    }>
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
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
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <button className="flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted transition-colors">
                <Bot className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Deploy New Agent</p>
                  <p className="text-xs text-muted-foreground">Add a new AI agent to your network</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted transition-colors">
                <Server className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Connect MCP Server</p>
                  <p className="text-xs text-muted-foreground">Integrate new MCP capabilities</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted transition-colors">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">View Analytics</p>
                  <p className="text-xs text-muted-foreground">Check performance metrics</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current health of your AIO-2030 infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium">API Gateway</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium">Agent Network</p>
                <p className="text-xs text-muted-foreground">All systems normal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <p className="text-sm font-medium">MCP Protocol</p>
                <p className="text-xs text-muted-foreground">Minor issues detected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

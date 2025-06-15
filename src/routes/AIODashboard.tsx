
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Circle, Wallet, TrendingUp, Award, Clock, Filter } from 'lucide-react';

interface StakingPosition {
  mcpName: string;
  stakedAmount: number;
  kappaMultiplier: number;
  totalStaked: number;
  userRatio: number;
}

interface ActivityRecord {
  id: string;
  timestamp: string;
  traceId: string;
  mcpName: string;
  agentName: string;
  estimatedReward: number;
  status: 'completed' | 'pending';
}

interface ClaimableReward {
  blockId: string;
  agent: string;
  creditUsage: number;
  rewardShare: number;
  kappa: number;
}

interface UserTier {
  name: 'Starter' | 'Builder' | 'Pro';
  creditEntitlement: number;
  usedCredits: number;
  requiredAIO: number;
}

const AIODashboard = () => {
  const [stakingPositions] = useState<StakingPosition[]>([
    { mcpName: 'ImageProcessor', stakedAmount: 25000, kappaMultiplier: 1.2, totalStaked: 500000, userRatio: 0.05 },
    { mcpName: 'TextAnalyzer', stakedAmount: 15000, kappaMultiplier: 0.8, totalStaked: 800000, userRatio: 0.0188 },
    { mcpName: 'VoiceTranscript', stakedAmount: 30000, kappaMultiplier: 1.5, totalStaked: 300000, userRatio: 0.1 },
  ]);

  const [activityRecords] = useState<ActivityRecord[]>([
    { id: '1', timestamp: '2025-01-15 14:30', traceId: 'AIO-TR-20250115-001', mcpName: 'ImageProcessor', agentName: 'Vision Agent', estimatedReward: 125.5, status: 'completed' },
    { id: '2', timestamp: '2025-01-15 13:45', traceId: 'AIO-TR-20250115-002', mcpName: 'TextAnalyzer', agentName: 'NLP Agent', estimatedReward: 89.2, status: 'completed' },
    { id: '3', timestamp: '2025-01-15 12:20', traceId: 'AIO-TR-20250115-003', mcpName: 'VoiceTranscript', agentName: 'Audio Agent', estimatedReward: 156.8, status: 'pending' },
  ]);

  const [claimableRewards] = useState<ClaimableReward[]>([
    { blockId: 'BLK-789123', agent: 'ImageProcessor', creditUsage: 2500, rewardShare: 125.5, kappa: 1.2 },
    { blockId: 'BLK-789124', agent: 'TextAnalyzer', creditUsage: 1800, rewardShare: 89.2, kappa: 0.8 },
    { blockId: 'BLK-789125', agent: 'VoiceTranscript', creditUsage: 3200, rewardShare: 156.8, kappa: 1.5 },
  ]);

  const [userTier] = useState<UserTier>({
    name: 'Builder',
    creditEntitlement: 500000,
    usedCredits: 127500,
    requiredAIO: 500
  });

  const [totalClaimable, setTotalClaimable] = useState(0);
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [currentEpoch] = useState('Epoch 3: Q2 2025');

  useEffect(() => {
    const total = claimableRewards.reduce((sum, reward) => sum + reward.rewardShare, 0);
    setTotalClaimable(total);
  }, [claimableRewards]);

  const creditDistributionData = [
    { name: 'Used', value: userTier.usedCredits, color: '#ef4444' },
    { name: 'Stacked', value: stakingPositions.reduce((sum, pos) => sum + pos.stakedAmount, 0), color: '#f59e0b' },
    { name: 'Available', value: userTier.creditEntitlement - userTier.usedCredits - stakingPositions.reduce((sum, pos) => sum + pos.stakedAmount, 0), color: '#10b981' },
  ];

  const rewardHistoryData = [
    { month: 'Jan', rewards: 1250 },
    { month: 'Feb', rewards: 1890 },
    { month: 'Mar', rewards: 2340 },
    { month: 'Apr', rewards: 2100 },
    { month: 'May', rewards: 2780 },
    { month: 'Jun', rewards: 3120 },
  ];

  const handleClaimRewards = () => {
    console.log('Claiming rewards:', totalClaimable);
    // Implement MetaMask integration here
  };

  const filteredActivities = filterAgent === 'all' 
    ? activityRecords 
    : activityRecords.filter(record => record.agentName === filterAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AIO-2030 Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Web3 + AI Token Economy Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              {currentEpoch}
            </Badge>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total Claimable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">{totalClaimable.toFixed(2)} $AIO</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Staked Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {stakingPositions.reduce((sum, pos) => sum + pos.stakedAmount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Current Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{userTier.name}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Avg κ Multiplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {(stakingPositions.reduce((sum, pos) => sum + pos.kappaMultiplier, 0) / stakingPositions.length).toFixed(2)}x
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="staking" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="staking">Staking & Stack</TabsTrigger>
            <TabsTrigger value="activity">AI Service Activity</TabsTrigger>
            <TabsTrigger value="rewards">Claimable Rewards</TabsTrigger>
            <TabsTrigger value="tier">Subscription Tier</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          {/* Staking & Stack Status */}
          <TabsContent value="staking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Your Staking Positions</CardTitle>
                  <CardDescription>Credits staked to MCP Servers with κ multipliers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stakingPositions.map((position, index) => (
                      <div key={index} className="border border-slate-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{position.mcpName}</h4>
                          <Badge 
                            variant={position.kappaMultiplier >= 1 ? "default" : "destructive"}
                            className={position.kappaMultiplier >= 1 ? "bg-green-600" : "bg-red-600"}
                          >
                            κ = {position.kappaMultiplier}x
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Staked:</span>
                            <div className="font-medium text-purple-400">{position.stakedAmount.toLocaleString()} Credits</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Your Ratio:</span>
                            <div className="font-medium text-orange-400">{(position.userRatio * 100).toFixed(2)}%</div>
                          </div>
                        </div>
                        <Progress 
                          value={position.userRatio * 100} 
                          className="mt-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">MCP Leaderboard</CardTitle>
                  <CardDescription>Top MCPs by total staked credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-slate-400">Rank</TableHead>
                        <TableHead className="text-slate-400">MCP Name</TableHead>
                        <TableHead className="text-slate-400">Total Staked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stakingPositions.sort((a, b) => b.totalStaked - a.totalStaked).map((position, index) => (
                        <TableRow key={index} className="border-slate-600">
                          <TableCell className="text-orange-400">#{index + 1}</TableCell>
                          <TableCell className="text-white">{position.mcpName}</TableCell>
                          <TableCell className="text-purple-400">{position.totalStaked.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Service Activity */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-cyan-400">Recent AI Service Activity</CardTitle>
                    <CardDescription>AIO protocol invocations and estimated rewards</CardDescription>
                  </div>
                  <Select value={filterAgent} onValueChange={setFilterAgent}>
                    <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all">All Agents</SelectItem>
                      <SelectItem value="Vision Agent">Vision Agent</SelectItem>
                      <SelectItem value="NLP Agent">NLP Agent</SelectItem>
                      <SelectItem value="Audio Agent">Audio Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-slate-400">Timestamp</TableHead>
                      <TableHead className="text-slate-400">Trace ID</TableHead>
                      <TableHead className="text-slate-400">MCP/Agent</TableHead>
                      <TableHead className="text-slate-400">Estimated Reward</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((record) => (
                      <TableRow key={record.id} className="border-slate-600">
                        <TableCell className="text-slate-300">{record.timestamp}</TableCell>
                        <TableCell className="text-cyan-400 font-mono text-sm">{record.traceId}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-white">{record.mcpName}</div>
                            <div className="text-slate-400 text-sm">{record.agentName}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-green-400 font-medium">{record.estimatedReward.toFixed(2)} $AIO</TableCell>
                        <TableCell>
                          <Badge 
                            variant={record.status === 'completed' ? 'default' : 'secondary'}
                            className={record.status === 'completed' ? 'bg-green-600' : 'bg-orange-600'}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claimable Rewards */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Claimable Rewards Breakdown</CardTitle>
                  <CardDescription>Rewards based on trace history and κ multipliers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-slate-400">Block ID</TableHead>
                        <TableHead className="text-slate-400">Agent/MCP</TableHead>
                        <TableHead className="text-slate-400">Credit Usage</TableHead>
                        <TableHead className="text-slate-400">κ Multiplier</TableHead>
                        <TableHead className="text-slate-400">Reward Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimableRewards.map((reward, index) => (
                        <TableRow key={index} className="border-slate-600">
                          <TableCell className="text-cyan-400 font-mono text-sm">{reward.blockId}</TableCell>
                          <TableCell className="text-white">{reward.agent}</TableCell>
                          <TableCell className="text-purple-400">{reward.creditUsage.toLocaleString()}</TableCell>
                          <TableCell className="text-orange-400">{reward.kappa}x</TableCell>
                          <TableCell className="text-green-400 font-medium">{reward.rewardShare.toFixed(2)} $AIO</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Claim Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{totalClaimable.toFixed(2)} $AIO</div>
                    <div className="text-slate-400 text-sm">Total Claimable</div>
                  </div>
                  
                  <Button 
                    onClick={handleClaimRewards}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Claim All Rewards
                  </Button>

                  <div className="text-xs text-slate-500 bg-slate-900/50 p-3 rounded">
                    <div className="flex items-center mb-1">
                      <Circle className="w-3 h-3 mr-1 text-orange-400" />
                      <span>Formula: reward = block_total × credit_ratio × κ</span>
                    </div>
                    <div className="text-orange-400">
                      ⚠️ Ensure κ ≥ 1 for optimal rewards
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tier */}
          <TabsContent value="tier" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Current Subscription: {userTier.name}</CardTitle>
                  <CardDescription>Credit entitlement and usage details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 text-sm">Credit Entitlement</div>
                      <div className="text-2xl font-bold text-purple-400">{userTier.creditEntitlement.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Used This Cycle</div>
                      <div className="text-2xl font-bold text-red-400">{userTier.usedCredits.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Usage Progress</span>
                      <span className="text-white">{((userTier.usedCredits / userTier.creditEntitlement) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(userTier.usedCredits / userTier.creditEntitlement) * 100} />
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded">
                    <div className="text-sm text-slate-400 mb-2">Upgrade to Pro Tier</div>
                    <div className="text-lg font-semibold text-green-400">1M Credits for {userTier.requiredAIO * 2} $AIO</div>
                    <Button className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Credit Distribution</CardTitle>
                  <CardDescription>Visual breakdown of credit allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={creditDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                      >
                        {creditDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {creditDistributionData.map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div 
                            className="w-3 h-3 rounded mr-2" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-slate-400">{item.name}</span>
                        </div>
                        <div className="font-semibold text-white">{item.value.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Governance */}
          <TabsContent value="governance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Emission & Governance</CardTitle>
                  <CardDescription>Current epoch and DAO participation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Current Epoch</span>
                      <Badge className="bg-cyan-600">{currentEpoch}</Badge>
                    </div>
                    <div className="text-sm text-slate-300">
                      Linear emission schedule active. Next epoch begins Q3 2025.
                    </div>
                  </div>

                  <div className="border border-slate-600 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Active DAO Proposals</h4>
                    <div className="space-y-3">
                      <div className="border-l-4 border-purple-500 pl-3">
                        <div className="font-medium text-white">Increase κ Base Multiplier</div>
                        <div className="text-sm text-slate-400">Proposer: DAO Treasury</div>
                        <div className="text-sm text-orange-400">Deadline: Jan 20, 2025</div>
                      </div>
                      <div className="border-l-4 border-green-500 pl-3">
                        <div className="font-medium text-white">New MCP Integration Program</div>
                        <div className="text-sm text-slate-400">Proposer: Community</div>
                        <div className="text-sm text-orange-400">Deadline: Jan 25, 2025</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Reward History</CardTitle>
                  <CardDescription>Historical block rewards by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={rewardHistoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rewards" 
                        stroke="#06b6d4" 
                        strokeWidth={3}
                        dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIODashboard;

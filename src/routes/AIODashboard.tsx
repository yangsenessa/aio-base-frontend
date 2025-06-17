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
import { getTotalAioTokenClaimable, getStackedRecordGroupByStackAmount, getMcpRewardsPaginated } from '@/services/can/financeOperation';
import { getAllMcpNames, getTracesPaginated } from '@/services/can/mcpOperations';
import { TraceLog } from '@/services/can/traceOperations';

interface StakingPosition {
  id: number;
  mcpName: string;
  totalStaked: number;
}

type ActivityRecord = TraceLog;

interface ClaimableReward {
  principalId: string;
  mcpName: string;
  rewardAmount: number;
  blockId: number;
  status: string;
}

interface UserTier {
  name: 'Starter' | 'Builder' | 'Pro';
  creditEntitlement: number;
  usedCredits: number;
  requiredAIO: number;
}

const AIODashboard = () => {
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [mcpNames, setMcpNames] = useState<string[]>([]);

  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 10;

  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>([]);
  const [rewardsPage, setRewardsPage] = useState(1);
  const [rewardsTotalPages, setRewardsTotalPages] = useState(1);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const rewardsPageSize = 10;

  const [userTier] = useState<UserTier>({
    name: 'Builder',
    creditEntitlement: 500000,
    usedCredits: 127500,
    requiredAIO: 500
  });

  const getCurrentEpoch = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Calculate quarter (Q1: 0-2, Q2: 3-5, Q3: 6-8, Q4: 9-11)
    const quarter = Math.floor(month / 3) + 1;
    
    // Calculate epoch number (assuming each year has 4 epochs)
    const epochNumber = (year - 2024) * 4 + quarter;
    
    return `Epoch ${epochNumber}: Q${quarter} ${year}`;
  };

  const [totalClaimable, setTotalClaimable] = useState(0);
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [currentEpoch] = useState(getCurrentEpoch());

  const fetchActivityRecords = async (page: number) => {
    setIsLoading(true);
    try {
      const offset = BigInt((page - 1) * pageSize);
      const limit = BigInt(pageSize);
      const traces = await getTracesPaginated(offset, limit);
      setActivityRecords(traces);
      // Assuming backend returns total count, adjust based on actual implementation
      setTotalPages(Math.ceil(100 / pageSize)); // Temporary fixed value, should be fetched from backend
    } catch (error) {
      console.error('Failed to fetch activity records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityRecords(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchTotalClaimable = async () => {
      try {
        const total = await getTotalAioTokenClaimable();
        setTotalClaimable(total);
      } catch (error) {
        console.error('Failed to fetch total claimable:', error);
      }
    };
    fetchTotalClaimable();
  }, []);

  useEffect(() => {
    const fetchStakingPositions = async () => {
      try {
        const positions = await getStackedRecordGroupByStackAmount();
        setStakingPositions(positions.map(pos => ({
          id: pos.id,
          mcpName: pos.mcp_name,
          totalStaked: pos.stack_amount
        })));
      } catch (error) {
        console.error('Failed to fetch staking positions:', error);
      }
    };

    fetchStakingPositions();
  }, []);

  useEffect(() => {
    const fetchMcpNames = async () => {
      try {
        const names = await getAllMcpNames();
        const nameList = Array.isArray(names)
          ? names.map(item => (item as any)?.mcp_name ?? String(item ?? ''))
          : [];
        setMcpNames(nameList);
      } catch (error) {
        console.error('Failed to fetch MCP names:', error);
      }
    };
    fetchMcpNames();
  }, []);

  const creditDistributionData = [
    { name: 'Used', value: userTier.usedCredits, color: '#ef4444' },
    { name: 'Stacked', value: stakingPositions.reduce((sum, pos) => sum + pos.totalStaked, 0), color: '#f59e0b' },
    { name: 'Available', value: userTier.creditEntitlement - userTier.usedCredits - stakingPositions.reduce((sum, pos) => sum + pos.totalStaked, 0), color: '#10b981' },
  ];

  const rewardHistoryData = [
    { month: 'Jan', rewards: 1250 },
    { month: 'Feb', rewards: 1890 },
    { month: 'Mar', rewards: 2340 },
    { month: 'Apr', rewards: 2100 },
    { month: 'May', rewards: 2780 },
    { month: 'Jun', rewards: 3120 },
  ];

  const fetchClaimableRewards = async (page: number) => {
    setIsLoadingRewards(true);
    try {
      const offset = BigInt((page - 1) * rewardsPageSize);
      const limit = BigInt(rewardsPageSize);
      const rewards = await getMcpRewardsPaginated(offset, limit);
      setClaimableRewards(rewards);
      // Assuming backend returns total count, adjust based on actual implementation
      setRewardsTotalPages(Math.ceil(100 / rewardsPageSize)); // Temporary fixed value, should be fetched from backend
    } catch (error) {
      console.error('Failed to fetch claimable rewards:', error);
    } finally {
      setIsLoadingRewards(false);
    }
  };

  useEffect(() => {
    fetchClaimableRewards(rewardsPage);
  }, [rewardsPage]);

  const handleClaimRewards = () => {
    console.log('Claiming rewards:', totalClaimable);
    // Implement MetaMask integration here
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRewardsPageChange = (page: number) => {
    setRewardsPage(page);
  };

  const filteredActivities = filterAgent === 'all' 
    ? activityRecords 
    : activityRecords.filter(record => record.calls[0]?.agent === filterAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AIO-2030 Dashboard
            </h1>
            <p className="text-slate-400 mt-2">AIO-2030 introduces a dual-currency token economy built around the native utility token $AIO and a programmable credit system known as Credits. This design enables seamless AI service invocation, incentive alignment, staking-based governance, and modular agent prioritization across a fully decentralized agentic AI network.</p>
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
                {stakingPositions.reduce((sum, pos) => sum + pos.totalStaked, 0).toLocaleString()}
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
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="staking" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="staking">Staking & Stack</TabsTrigger>
            <TabsTrigger value="activity">AI Service Activity</TabsTrigger>
            <TabsTrigger value="rewards">Mining Rewards</TabsTrigger>
            <TabsTrigger value="tier">Subscription Tier</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          {/* Staking & Stack Status */}
          <TabsContent value="staking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      {mcpNames.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-slate-400">Trace ID</TableHead>
                      <TableHead className="text-slate-400">MCP/Agent</TableHead>
                      <TableHead className="text-slate-400">Method</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((record) => (
                      <TableRow key={record.trace_id} className="border-slate-600">
                        <TableCell className="text-slate-300">
                          {record.trace_id}
                        </TableCell>
                        <TableCell className="text-cyan-400 font-mono text-sm">{record.context_id}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-white">{record.calls[0]?.protocol}</div>
                            <div className="text-slate-400 text-sm">{record.calls[0]?.agent}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-green-400 font-medium">{record.calls[0]?.method}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={record.calls[0]?.status === 'ok' ? 'default' : 'secondary'}
                            className={record.calls[0]?.status === 'ok' ? 'bg-green-600' : 'bg-orange-600'}
                          >
                            {record.calls[0]?.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {isLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-4 px-4">
                    <div className="text-sm text-slate-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-slate-600 text-slate-400 hover:bg-slate-700"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-slate-600 text-slate-400 hover:bg-slate-700"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
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
                        <TableHead className="text-slate-400">MCP Name</TableHead>
                        <TableHead className="text-slate-400">Principal ID</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400">Reward Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimableRewards.map((reward, index) => (
                        <TableRow key={index} className="border-slate-600">
                          <TableCell className="text-cyan-400 font-mono text-sm">{reward.blockId}</TableCell>
                          <TableCell className="text-white">{reward.mcpName}</TableCell>
                          <TableCell className="text-orange-400 font-mono text-sm">{reward.principalId}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={reward.status === 'claimed' ? 'default' : 'secondary'}
                              className={reward.status === 'claimed' ? 'bg-green-600' : 'bg-orange-600'}
                            >
                              {reward.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-green-400 font-medium">{reward.rewardAmount.toFixed(2)} $AIO</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {isLoadingRewards ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-4 px-4">
                      <div className="text-sm text-slate-400">
                        Page {rewardsPage} of {rewardsTotalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRewardsPageChange(rewardsPage - 1)}
                          disabled={rewardsPage === 1}
                          className="border-slate-600 text-slate-400 hover:bg-slate-700"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRewardsPageChange(rewardsPage + 1)}
                          disabled={rewardsPage === rewardsTotalPages}
                          className="border-slate-600 text-slate-400 hover:bg-slate-700"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
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

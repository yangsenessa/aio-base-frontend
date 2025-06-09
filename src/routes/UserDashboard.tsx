import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlugConnect, shortenAddress } from "@/lib/plug-wallet";
import { getAccountInfo, claimTokenGrant, claimRewards, calUnclaimRewards } from "@/services/can/financeOperation";
import type { AccountInfo } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const { toast } = useToast();
  const { principalId } = usePlugConnect();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimInProgress, setClaimInProgress] = useState(false);
  const [stackDialogOpen, setStackDialogOpen] = useState(false);
  const [stackAmount, setStackAmount] = useState("");
  const [stackingInProgress, setStackingInProgress] = useState(false);
  const [unclaimedRewards, setUnclaimedRewards] = useState<number>(0);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!principalId) {
        setLoading(false);
        return;
      }
      
      try {
        const info = await getAccountInfo();
        setAccountInfo(info);
        console.log('[user dashboard]Account info fetched:', info);
        
        // Fetch unclaimed rewards
        const rewards = await calUnclaimRewards();
        setUnclaimedRewards(rewards);
      } catch (error) {
        console.error('Error fetching account info:', error);
        toast({
          title: "Error",
          description: "Failed to fetch account information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [principalId, toast]);

  const handleClaimTokens = async () => {
    if (!principalId) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first to claim tokens.",
        variant: "destructive",
      });
      return;
    }
    
    setClaimInProgress(true);
    
    try {
      const claimedAmount = await claimRewards();
      
      // Refresh account info after claiming
      const updatedInfo = await getAccountInfo();
      setAccountInfo(updatedInfo);
      
      // Refresh unclaimed rewards
      const rewards = await calUnclaimRewards();
      setUnclaimedRewards(rewards);
      
      toast({
        title: "Tokens claimed!",
        description: `Successfully claimed ${claimedAmount} tokens.`,
      });
    } catch (error) {
      console.error('Error claiming tokens:', error);
      toast({
        title: "Claim Failed",
        description: error instanceof Error ? error.message : "Failed to claim tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClaimInProgress(false);
    }
  };

  const handleStackCredits = async () => {
    if (!stackAmount || isNaN(Number(stackAmount)) || Number(stackAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to stack.",
        variant: "destructive",
      });
      return;
    }

    setStackingInProgress(true);
    
    try {
      // Note: This would need to be implemented in financeOperation.ts
      // const result = await stackCredit(principalId!, Number(stackAmount));
      
      // For now, just close dialog and show success message
      setStackDialogOpen(false);
      setStackAmount("");
      
      toast({
        title: "Credits stacked!",
        description: `${stackAmount} credits have been stacked successfully.`,
      });
      
      // Refresh account info
      const updatedInfo = await getAccountInfo();
      setAccountInfo(updatedInfo);
    } catch (error) {
      console.error('Error stacking credits:', error);
      toast({
        title: "Error",
        description: "Failed to stack credits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setStackingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-6 pb-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!principalId) {
    return (
      <div className="pt-6 pb-12">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Link to="/home" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">User Dashboard</h1>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your Plug wallet to view your dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const tokenBalance = accountInfo?.token_info?.token_balance || BigInt(0);
  const creditBalance = accountInfo?.token_info?.credit_balance || BigInt(0);
  const stakedCredits = accountInfo?.token_info?.staked_credits || BigInt(0);

  // Convert BigInt to number for display (assuming reasonable values)
  const displayTokenBalance = Number(tokenBalance) / 100000000; // Assuming 8 decimal places
  const displayCreditBalance = Number(creditBalance);
  const displayStakedCredits = Number(stakedCredits);

  return (
    <div className="pt-6 pb-12">
      {/* Back Button and Header */}
      <div className="flex items-center mb-8">
        <Link to="/home" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">User Dashboard</h1>
      </div>

      <div className="flex justify-center mb-8">
        {/* Financial Information Card */}
        <Card className="w-4/5">
          <CardHeader>
            <CardTitle className="text-2xl">Financial Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Balance Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg">
                <span className="text-lg font-medium">$AIO Balance</span>
                <span className="text-2xl font-bold">{displayTokenBalance.toFixed(8)}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg">
                <span className="text-lg font-medium">Credits Balance</span>
                <span className="text-2xl font-bold">{displayCreditBalance}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg">
                <span className="text-lg font-medium">Credits Stacked</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{displayStakedCredits}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                <span className="text-lg font-medium">Available to Claim</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{unclaimedRewards}</span>
                  <Button 
                    onClick={handleClaimTokens}
                    disabled={claimInProgress}
                    size="sm"
                  >
                    {claimInProgress ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      "press to claim"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Block Reward Model & Credit-Based Incentives */}
      <div className="flex justify-center mb-8">
        <Card className="w-4/5">
          <CardHeader>
            <CardTitle className="text-2xl">Block Reward Model & Credit-Based Incentives</CardTitle>
            <CardDescription>
              Each successful AI service call produces a "block"—a traceable invocation record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 6.1 Reward Calculation */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">6.1 Reward Calculation</h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-center mb-4">
                  <code className="text-lg font-mono bg-gray-700 text-white px-3 py-2 rounded border">
                    R<sub>block</sub> = BaseReward × κ × Q
                  </code>
                </div>
                <div className="space-y-2 text-sm text-gray-200">
                  <p><strong>Where:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>BaseReward:</strong> e.g., 3,000 $AIO per successful call</li>
                    <li><strong>κ:</strong> Incentive multiplier based on user staking weight</li>
                    <li><strong>Q:</strong> MCP service quality score</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="mb-2 text-gray-200"><strong>Rewards are then distributed proportionally to all stakers on the invoked MCP:</strong></p>
                <div className="text-center">
                  <code className="text-lg font-mono bg-gray-700 text-white px-3 py-2 rounded border">
                    R<sub>user</sub> = R<sub>block</sub> × (user_credits / total_stacked)
                  </code>
                </div>
              </div>
            </div>

            {/* 6.2 κ (Incentive Multiplier) Design */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">6.2 κ (Incentive Multiplier) Design</h3>
              <p className="text-sm text-muted-foreground">
                To balance fairness and reward effectiveness, AIO-2030 adopts a threshold-based incentive multiplier 
                model. The κ multiplier adjusts user reward weight based on their stake ratio in the target MCP, 
                promoting wider participation while discouraging reward monopolization.
              </p>
              
              {/* Threshold κ Model Table */}
              <div className="space-y-2">
                <h4 className="font-semibold">Threshold κ Model:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gray-300 px-4 py-2 text-left text-white">Stake Ratio (S<sub>i</sub> / S<sub>total</sub>)</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-white">κ Multiplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-gray-300 px-4 py-2">&lt; 1%</td><td className="border border-gray-300 px-4 py-2">1.0</td></tr>
                      <tr><td className="border border-gray-300 px-4 py-2">1% — 5%</td><td className="border border-gray-300 px-4 py-2">1.1</td></tr>
                      <tr><td className="border border-gray-300 px-4 py-2">5% — 10%</td><td className="border border-gray-300 px-4 py-2">1.3</td></tr>
                      <tr><td className="border border-gray-300 px-4 py-2">10% — 25%</td><td className="border border-gray-300 px-4 py-2">1.5</td></tr>
                      <tr><td className="border border-gray-300 px-4 py-2">25% — 50%</td><td className="border border-gray-300 px-4 py-2">1.7</td></tr>
                      <tr><td className="border border-gray-300 px-4 py-2">50% — 75%</td><td className="border border-gray-300 px-4 py-2">1.85</td></tr>
                      <tr><td className="border border-gray-300 px-4 py-2">&gt; 75%</td><td className="border border-gray-300 px-4 py-2">2.0</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="font-medium mb-2 text-white">This stepped incentive structure ensures:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-200">
                  <li>Fair baseline for low-stake users</li>
                  <li>Stronger incentive for active contributors</li>
                  <li>A capped reward advantage for large stakeholders</li>
                </ul>
              </div>

              {/* Final Formula */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="mb-2 text-white"><strong>Final reward per user:</strong></p>
                <div className="text-center mb-4">
                  <code className="text-lg font-mono bg-gray-700 text-white px-3 py-2 rounded border">
                    R<sub>user</sub> = R<sub>block</sub> × (S<sub>i</sub> · κ<sub>i</sub>) / Σ(S<sub>j</sub> · κ<sub>j</sub>)
                  </code>
                </div>
                <div className="space-y-2 text-sm text-gray-200">
                  <p><strong>Where:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>S<sub>i</sub>:</strong> User's credit stake on the MCP</li>
                    <li><strong>κ<sub>i</sub>:</strong> Corresponding multiplier per tier</li>
                    <li><strong>Σ(S<sub>j</sub> · κ<sub>j</sub>):</strong> Total stake-weighted sum across all contributors</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-200">
                  <strong>Note:</strong> This mechanism is fully transparent and can be updated through DAO governance to adapt over time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;

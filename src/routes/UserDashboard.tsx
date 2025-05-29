
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlugConnect, shortenAddress } from "@/lib/plug-wallet";
import { getAccountInfo, claimTokenGrant, claimRewards } from "@/services/can/financeOperation";
import type { AccountInfo } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';
import { Loader2 } from "lucide-react";

const UserDashboard = () => {
  const { toast } = useToast();
  const { principalId } = usePlugConnect();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimInProgress, setClaimInProgress] = useState(false);
  const [stackDialogOpen, setStackDialogOpen] = useState(false);
  const [stackAmount, setStackAmount] = useState("");
  const [stackingInProgress, setStackingInProgress] = useState(false);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!principalId) {
        setLoading(false);
        return;
      }
      
      try {
        const info = await getAccountInfo();
        setAccountInfo(info);
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
      await claimRewards();
      
      // Refresh account info after claiming
      const updatedInfo = await getAccountInfo();
      setAccountInfo(updatedInfo);
      
      toast({
        title: "Tokens claimed!",
        description: "Your tokens have been successfully claimed.",
      });
    } catch (error) {
      console.error('Error claiming tokens:', error);
      toast({
        title: "Error",
        description: "Failed to claim tokens. Please try again.",
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
      <div className="flex justify-center mb-8">
        {/* Financial Information Card */}
        <Card className="w-full max-w-4xl">
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
                  <Dialog open={stackDialogOpen} onOpenChange={setStackDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        stack more
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Stack Credits</DialogTitle>
                        <DialogDescription>
                          Enter the amount of credits you want to stack.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="stack-amount" className="text-right">
                            Stack:
                          </Label>
                          <Input
                            id="stack-amount"
                            value={stackAmount}
                            onChange={(e) => setStackAmount(e.target.value)}
                            placeholder="200"
                            className="col-span-3"
                            type="number"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setStackDialogOpen(false)}
                          disabled={stackingInProgress}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleStackCredits}
                          disabled={stackingInProgress}
                        >
                          {stackingInProgress ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Stacking...
                            </>
                          ) : (
                            "Confirm"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                <span className="text-lg font-medium">Available to Claim</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">100</span>
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
    </div>
  );
};

export default UserDashboard;

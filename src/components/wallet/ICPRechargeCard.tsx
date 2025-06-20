
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePlugConnect } from '@/lib/plug-wallet';
import { 
  getCreditsPerIcpApi, 
  simulateCreditFromIcpApi, 
  getRechargePrincipalAccountApi,
  rechargeAndConvertCreditsApi 
} from '@/services/can/financeOperation';

const ICPRechargeCard = () => {
  const { toast } = useToast();
  const { principalId, transferICP } = usePlugConnect();
  
  const [icpAmount, setIcpAmount] = useState<string>('');
  const [creditsPerIcp, setCreditsPerIcp] = useState<number>(0);
  const [estimatedCredits, setEstimatedCredits] = useState<number>(0);
  const [targetAccount, setTargetAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Get exchange rate
        const rate = await getCreditsPerIcpApi();
        setCreditsPerIcp(rate);
        
        // Get target account for transfers
        const account = await getRechargePrincipalAccountApi();
        if (account?.principal_id) {
          setTargetAccount(account.principal_id);
        }
        
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load exchange rate information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (principalId) {
      loadInitialData();
    }
  }, [principalId, toast]);

  // Calculate estimated credits when ICP amount changes
  useEffect(() => {
    const calculateCredits = async () => {
      if (icpAmount && !isNaN(parseFloat(icpAmount)) && parseFloat(icpAmount) > 0) {
        try {
          const credits = await simulateCreditFromIcpApi(parseFloat(icpAmount));
          setEstimatedCredits(credits);
        } catch (error) {
          console.error('Error calculating credits:', error);
          setEstimatedCredits(0);
        }
      } else {
        setEstimatedCredits(0);
      }
    };

    calculateCredits();
  }, [icpAmount]);

  const handleRecharge = async () => {
    if (!icpAmount || isNaN(parseFloat(icpAmount)) || parseFloat(icpAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid ICP amount",
        variant: "destructive",
      });
      return;
    }

    if (!targetAccount) {
      toast({
        title: "No Target Account",
        description: "Unable to find recharge target account",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Transfer ICP to target account
      const transferResult = await transferICP({
        to: targetAccount,
        amount: parseFloat(icpAmount),
        memo: `Credit recharge - ${Date.now()}`
      });

      if (!transferResult) {
        throw new Error('ICP transfer failed');
      }

      // Step 2: Convert ICP to credits on backend
      const creditsObtained = await rechargeAndConvertCreditsApi(parseFloat(icpAmount));

      // Step 3: Show success notification
      toast({
        title: "Recharge Successful! 🎉",
        description: `Successfully recharged ${creditsObtained} credits using ${icpAmount} ICP`,
      });

      // Reset form
      setIcpAmount('');
      setEstimatedCredits(0);

    } catch (error: any) {
      console.error('Recharge failed:', error);
      toast({
        title: "Recharge Failed",
        description: error.message || "Failed to complete the recharge process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!principalId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            ICP to Credits Recharge
          </CardTitle>
          <CardDescription>
            Connect your wallet to recharge credits using ICP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please connect your Plug wallet to access the recharge feature
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          ICP to Credits Recharge
        </CardTitle>
        <CardDescription>
          Exchange ICP for credits to power your AI interactions and earn $AIO rewards through staking
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Benefits explanation */}
        <div className="p-4 bg-primary/5 rounded-lg space-y-2">
          <h3 className="font-medium text-sm">Why recharge credits?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Power AI Models:</strong> Use credits to pay for AI model calculations and interactions</li>
            <li>• <strong>Earn $AIO Tokens:</strong> Stack credits to earn $AIO token rewards through our staking system</li>
            <li>• <strong>Flexible Usage:</strong> Credits provide a convenient way to manage your AI service consumption</li>
          </ul>
        </div>

        {/* Exchange rate info */}
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading exchange rate...
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <span className="text-sm">Current Exchange Rate:</span>
            <span className="font-medium">{creditsPerIcp} Credits per ICP</span>
          </div>
        )}

        {/* Input section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="icp-amount">ICP Amount</Label>
            <Input
              id="icp-amount"
              type="number"
              placeholder="Enter ICP amount"
              value={icpAmount}
              onChange={(e) => setIcpAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={isProcessing}
            />
          </div>

          {/* Estimated credits display */}
          {estimatedCredits > 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm text-green-700">You will receive:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-800">{estimatedCredits} Credits</span>
                <ArrowRight className="h-4 w-4 text-green-600" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleRecharge}
          disabled={!icpAmount || parseFloat(icpAmount) <= 0 || isProcessing || isLoading}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Recharge...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Recharge Credits
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ICPRechargeCard;

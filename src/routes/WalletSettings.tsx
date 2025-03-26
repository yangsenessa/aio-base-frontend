
import React from 'react';
import { usePlugConnect } from '@/lib/plug-wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug } from 'lucide-react';

const WalletSettings = () => {
  const { 
    principalId, 
    handleConnectWallet, 
    disconnectWallet, 
    isConnecting, 
    shortenAddress 
  } = usePlugConnect();

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Wallet Settings</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Plug Wallet Connection
          </CardTitle>
          <CardDescription>
            Manage your Internet Computer Plug wallet connection
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {principalId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Connected Principal ID</p>
                  <p className="text-xs text-muted-foreground break-all font-mono mt-1">{principalId}</p>
                </div>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Connected
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-secondary/10 rounded-lg">
              <p className="text-center text-muted-foreground">
                You are not connected to any wallet. Connect your Plug wallet to interact with Internet Computer.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-4">
          {principalId ? (
            <>
              <Button variant="outline" onClick={disconnectWallet}>
                Disconnect Wallet
              </Button>
            </>
          ) : (
            <Button onClick={handleConnectWallet} disabled={isConnecting}>
              <Plug className="mr-2 h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect Plug Wallet'}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>About Plug Wallet</CardTitle>
          <CardDescription>
            Information about the Internet Computer Plug wallet
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p>
            Plug is a browser extension and wallet for the Internet Computer. 
            It allows you to interact with decentralized applications (dApps) built on the Internet Computer Protocol.
          </p>
          
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h3 className="font-medium mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Secure management of your ICP identity</li>
              <li>Connect to dApps on the Internet Computer</li>
              <li>Send and receive ICP and other tokens</li>
              <li>Explore the Internet Computer ecosystem</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button variant="outline" onClick={() => window.open('https://plugwallet.ooo/', '_blank')}>
            Learn More About Plug
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WalletSettings;

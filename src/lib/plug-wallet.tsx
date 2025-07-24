import { useState, useEffect, useRef } from 'react';
import { toast } from "@/hooks/use-toast";

// Define types for Plug wallet
declare global {
  interface Window {
    ic?: {
      plug?: {
        isConnected: () => Promise<boolean>;
        requestConnect: (options?: {
          whitelist?: string[];
          host?: string;
        }) => Promise<boolean>;
        disconnect: () => Promise<void>;
        createAgent: (options?: {
          whitelist?: string[];
          host?: string;
        }) => Promise<any>;
        getPrincipal: () => Promise<any>;
        getAccountId: () => Promise<string>;
        requestTransfer: (params: {
          to: string;
          amount: number;
          memo?: string;
        }) => Promise<{ height: number }>;
      };
    };
  }
}

// Storage utility functions for handling principal ID
export const plugStorage = {
  setPrincipal: (principal: string) => {
    localStorage.setItem('plug_principal_id', principal);
  },
  
  getPrincipal: (): string | null => {
    return localStorage.getItem('plug_principal_id');
  },
  
  clearPrincipal: () => {
    localStorage.removeItem('plug_principal_id');
  }
};

/**
 * Custom hook for Plug wallet integration
 */
export const usePlug = () => {
  const [principalId, setPrincipalId] = useState<string | null>(plugStorage.getPrincipal());
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const isMountedRef = useRef(true);

  // Check if Plug wallet is installed
  const isPlugInstalled = (): boolean => {
    return Boolean(window.ic && window.ic.plug);
  };

  // Function to connect wallet
  const connectWallet = async (options?: {
    whitelist?: string[];
    host?: string;
  }): Promise<string | null> => {
    if (!isMountedRef.current) return null;
    
    setIsConnecting(true);
    setError(null);

    try {
      if (!isPlugInstalled()) {
        throw new Error('Plug wallet is not installed');
      }

      // Connect to Plug wallet
      const connected = await window.ic.plug.requestConnect(options);
      if (connected && isMountedRef.current) {
        // Get principal ID
        const principal = await window.ic.plug.getPrincipal();
        const principalId = principal.toString();
        
        if (isMountedRef.current) {
          setPrincipalId(principalId);
          plugStorage.setPrincipal(principalId);
          
          toast({
            title: "Wallet Connected",
            description: `Connected with Plug wallet: ${shortenAddress(principalId)}`,
          });
        }
        
        return principalId;
      }
      return null;
    } catch (err: any) {
      console.error('Failed to connect to Plug wallet:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Failed to connect');
        
        toast({
          title: "Connection Failed",
          description: err.message || "Failed to connect to Plug wallet",
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsConnecting(false);
      }
    }
  };

  // Function to disconnect
  const disconnectWallet = async (): Promise<void> => {
    if (!isMountedRef.current) return;
    
    try {
      if (isPlugInstalled() && await window.ic.plug.isConnected()) {
        await window.ic.plug.disconnect();
      }
      
      if (isMountedRef.current) {
        setPrincipalId(null);
        plugStorage.clearPrincipal();
        
        toast({
          title: "Wallet Disconnected",
          description: "Successfully disconnected from Plug wallet",
        });
      }
    } catch (err: any) {
      console.error('Failed to disconnect from Plug wallet:', err);
      
      if (isMountedRef.current) {
        toast({
          title: "Disconnect Failed",
          description: err.message || "Failed to disconnect from Plug wallet",
          variant: "destructive",
        });
      }
    }
  };

  // Function to transfer ICP
  const transferICP = async (params: {
    to: string;
    amount: number;
    memo?: string;
  }): Promise<{ height: number } | null> => {
    if (!isMountedRef.current) return null;
    
    setIsTransferring(true);
    setError(null);

    try {
      if (!isPlugInstalled()) {
        throw new Error('Plug wallet is not installed');
      }

      if (!await window.ic.plug.isConnected()) {
        throw new Error('Plug wallet is not connected');
      }

      // Validate parameters
      if (!params.to || params.to.trim() === '') {
        throw new Error('Recipient principal ID is required');
      }

      if (!params.amount || params.amount <= 0) {
        throw new Error('Transfer amount must be greater than 0');
      }

      // Convert amount to e8s (ICP has 8 decimal places)
      const amountInE8s = Math.floor(params.amount * 100_000_000);

      // Request transfer
      const result = await window.ic.plug.requestTransfer({
        to: params.to,
        amount: amountInE8s,
        memo: params.memo || '',
      });

      if (isMountedRef.current) {
        toast({
          title: "Transfer Successful",
          description: `Successfully transferred ${params.amount} ICP to ${shortenAddress(params.to)}`,
        });
      }

      return result;
    } catch (err: any) {
      console.error('Failed to transfer ICP:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Failed to transfer ICP');
        
        toast({
          title: "Transfer Failed",
          description: err.message || "Failed to transfer ICP",
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsTransferring(false);
      }
    }
  };

  // Check connection on load
  useEffect(() => {
    const checkConnection = async () => {
      if (isPlugInstalled()) {
        try {
          const isConnected = await window.ic.plug.isConnected();
          if (isConnected && isMountedRef.current) {
            const principal = await window.ic.plug.getPrincipal();
            const principalId = principal.toString();
            if (isMountedRef.current) {
              setPrincipalId(principalId);
              plugStorage.setPrincipal(principalId);
            }
          }
        } catch (err) {
          console.error("Error checking Plug wallet connection:", err);
        }
      }
    };

    checkConnection();

    // Cleanup function to prevent memory leaks
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    principalId,
    isConnecting,
    isTransferring,
    error,
    connectWallet,
    disconnectWallet,
    isPlugInstalled,
    transferICP,
  };
};

// Helper to format address for display
export const shortenAddress = (address: string | null | undefined): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Helper function to check if device is mobile
export const isMobileDevice = (): boolean => {
  return 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    (navigator as any).msMaxTouchPoints > 0;
};

// Main hook to use in components
export const usePlugConnect = () => {
  const {
    principalId,
    connectWallet,
    disconnectWallet,
    isConnecting,
    isTransferring,
    isPlugInstalled,
    transferICP,
  } = usePlug();
  
  const handleConnectWallet = async () => {
    if (isPlugInstalled()) {
      await connectWallet();
    } else {
      // Instead of directly opening the website, show a toast notification
      toast({
        title: "Plug Wallet Not Installed",
        description: "Please install the Plug wallet extension to connect.",
        variant: "destructive",
      });
      
      // Optionally open the website to help users find the extension
      if (confirm("Would you like to visit the Plug Wallet website to install the extension?")) {
        window.open('https://plugwallet.ooo/', '_blank');
      }
    }
  };
  
  return {
    principalId,
    isConnecting,
    isTransferring,
    handleConnectWallet,
    disconnectWallet,
    transferICP,
    shortenAddress,
  };
};

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Shield, Zap, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { useSDUPIBlockchain } from '@/hooks/useSDUPIBlockchain';

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isAvailable: boolean;
  connect: () => Promise<void>;
}

export function WalletConnectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { 
    connectWallet, 
    disconnectWallet, 
    isConnected, 
    currentAccount, 
    sdupiBalance 
  } = useSDUPIBlockchain();

  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect with MetaMask wallet',
      icon: <Wallet className="w-6 h-6" />,
      isAvailable: true,
             connect: async () => {
         try {
           setIsConnecting(true);
           setError(null);
           await connectWallet();
           setSuccess('MetaMask connected successfully!');
           setTimeout(() => setIsOpen(false), 1500);
         } catch (err) {
           setError('Failed to connect MetaMask. Please make sure MetaMask is installed.');
         } finally {
           setIsConnecting(false);
         }
       }
    },
    {
      id: 'phantom',
      name: 'Phantom',
      description: 'Connect with Phantom wallet',
      icon: <Shield className="w-6 h-6" />,
      isAvailable: true,
             connect: async () => {
         try {
           setIsConnecting(true);
           setError(null);
           await connectWallet();
           setSuccess('Phantom connected successfully!');
           setTimeout(() => setIsOpen(false), 1500);
         } catch (err) {
           setError('Failed to connect Phantom. Please make sure Phantom is installed.');
         } finally {
           setIsConnecting(false);
         }
       }
    },
    {
      id: 'brave',
      name: 'Brave Wallet',
      description: 'Connect with Brave wallet',
      icon: <Zap className="w-6 h-6" />,
      isAvailable: true,
             connect: async () => {
         try {
           setIsConnecting(true);
           setError(null);
           await connectWallet();
           setSuccess('Brave Wallet connected successfully!');
           setTimeout(() => setIsOpen(false), 1500);
         } catch (err) {
           setError('Failed to connect Brave Wallet. Please make sure Brave Wallet is installed.');
         } finally {
           setIsConnecting(false);
         }
       }
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      description: 'Connect with any wallet via QR code',
      icon: <Globe className="w-6 h-6" />,
      isAvailable: true,
             connect: async () => {
         try {
           setIsConnecting(true);
           setError(null);
           await connectWallet();
           setSuccess('WalletConnect initiated! Please scan the QR code.');
         } catch (err) {
           setError('Failed to initiate WalletConnect.');
         } finally {
           setIsConnecting(false);
         }
       }
    }
  ];

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setSuccess('Wallet disconnected successfully!');
    } catch (err) {
      setError('Failed to disconnect wallet.');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B SDUPI`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M SDUPI`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K SDUPI`;
    return `${num.toFixed(2)} SDUPI`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isConnected ? (
          <Button variant="outline" className="gap-2">
            <Wallet className="w-4 h-4" />
            {formatAddress(currentAccount || '')}
            <Badge variant="secondary" className="ml-2">
              {formatBalance(sdupiBalance || '0')}
            </Badge>
          </Button>
        ) : (
          <Button className="gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
          </DialogTitle>
        </DialogHeader>

        {isConnected ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                                 <CardTitle className="text-lg">Connected Wallet</CardTitle>
                <CardDescription>Connected Wallet Information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Address:</span>
                                     <code className="text-xs bg-muted px-2 py-1 rounded">
                     {formatAddress(currentAccount || '')}
                   </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                                     <Badge variant="outline">
                     {formatBalance(sdupiBalance || '0')}
                   </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <Badge variant="secondary">SDUPI Testnet</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              onClick={handleDisconnect} 
              variant="destructive" 
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">{success}</span>
              </div>
            )}

            <div className="grid gap-3">
              {walletOptions.map((wallet) => (
                <Card 
                  key={wallet.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !wallet.isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => wallet.isAvailable && wallet.connect()}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {wallet.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{wallet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {wallet.description}
                        </p>
                      </div>
                      {isConnecting && wallet.id === 'metamask' && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>By connecting your wallet, you agree to our Terms of Service</p>
              <p>and acknowledge that you have read our Privacy Policy.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Coins, Zap, Clock, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useSDUPIBlockchain } from '@/hooks/useSDUPIBlockchain';

export function SDUPIFaucet() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('1000');
  const [isRequesting, setIsRequesting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<number | null>(null);
  
  const { isConnected, currentAccount, sdupiBalance } = useSDUPIBlockchain();

  // Faucet configuration
  const faucetConfig = {
    dailyLimit: 10000, // 10K SDUPI per day
    perRequestLimit: 1000, // 1K SDUPI per request
    cooldown: 3600000, // 1 hour cooldown between requests
    network: 'SDUPI Testnet',
    chainId: '1337',
    rpcUrl: 'http://localhost:8080'
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    // Auto-fill with connected wallet address
    if (isConnected && currentAccount && value === '') {
      setAddress(currentAccount);
    }
  };

  const validateAddress = (addr: string): boolean => {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const validateAmount = (amt: string): boolean => {
    const num = parseInt(amt);
    return num > 0 && num <= faucetConfig.perRequestLimit;
  };

  const canRequest = (): boolean => {
    if (!validateAddress(address) || !validateAmount(amount)) return false;
    
    // Check cooldown
    if (lastRequest && Date.now() - lastRequest < faucetConfig.cooldown) return false;
    
    return true;
  };

  const getCooldownTime = (): string => {
    if (!lastRequest) return '';
    
    const timeLeft = faucetConfig.cooldown - (Date.now() - lastRequest);
    if (timeLeft <= 0) return '';
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const requestTokens = async () => {
    if (!canRequest()) return;
    
    try {
      setIsRequesting(true);
      setError(null);
      setSuccess(null);
      
      // Simulate faucet request (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll simulate a successful transaction
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      setSuccess(`Tokens sent successfully! Transaction: ${txHash}`);
      setLastRequest(Date.now());
      
      // Clear form after successful request
      setTimeout(() => {
        setSuccess(null);
        setAddress('');
        setAmount('1000');
      }, 5000);
      
    } catch (err) {
      setError('Failed to request tokens. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const copyAddress = () => {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount);
      // You could add a toast notification here
    }
  };

  const openExplorer = () => {
    if (currentAccount) {
      window.open(`http://localhost:3000/explorer/address/${currentAccount}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Coins className="w-8 h-8 text-primary" />
          SDUPI Testnet Faucet
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get test SDUPI tokens to explore the blockchain, test smart contracts, and participate in the network.
          This faucet is for testing purposes only.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Faucet Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Request Test Tokens
            </CardTitle>
            <CardDescription>
              Enter your wallet address and amount to receive test SDUPI tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Wallet Address</label>
              <div className="flex gap-2">
                <Input
                  placeholder="0x..."
                  value={address}
                  onChange={handleAddressChange}
                  className="flex-1"
                />
                {isConnected && currentAccount && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {!validateAddress(address) && address && (
                <p className="text-sm text-destructive">Invalid Ethereum address</p>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (SDUPI)</label>
              <Input
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max={faucetConfig.perRequestLimit}
              />
              <p className="text-xs text-muted-foreground">
                Max: {faucetConfig.perRequestLimit.toLocaleString()} SDUPI per request
              </p>
            </div>

            {/* Request Button */}
            <Button
              onClick={requestTokens}
              disabled={!canRequest() || isRequesting}
              className="w-full"
              size="lg"
            >
              {isRequesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Request {amount} SDUPI
                </>
              )}
            </Button>

            {/* Cooldown Info */}
            {lastRequest && getCooldownTime() && (
              <Alert>
                <Clock className="w-4 h-4" />
                <AlertDescription>
                  Cooldown active: {getCooldownTime()} remaining
                </AlertDescription>
              </Alert>
            )}

            {/* Success/Error Messages */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Faucet Info & Stats */}
        <div className="space-y-4">
          {/* Network Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Network Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge variant="outline">{faucetConfig.network}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Chain ID:</span>
                <Badge variant="secondary">{faucetConfig.chainId}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">RPC URL:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {faucetConfig.rpcUrl}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Faucet Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Faucet Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Daily Limit:</span>
                <Badge variant="outline">
                  {faucetConfig.dailyLimit.toLocaleString()} SDUPI
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Per Request:</span>
                <Badge variant="outline">
                  {faucetConfig.perRequestLimit.toLocaleString()} SDUPI
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cooldown:</span>
                <Badge variant="secondary">1 hour</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Connected Wallet Info */}
          {isConnected && currentAccount && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <Badge variant="outline">
                    {parseFloat(sdupiBalance || '0').toLocaleString()} SDUPI
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openExplorer}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use the Faucet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Connect Wallet</h4>
              <p className="text-muted-foreground">
                Use the wallet connection button above to connect your MetaMask or other wallet.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Request Tokens</h4>
              <p className="text-muted-foreground">
                Enter your wallet address and the amount of SDUPI tokens you need for testing.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Start Testing</h4>
              <p className="text-muted-foreground">
                Use your test tokens to explore the blockchain, deploy contracts, and test features.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">⚠️ Important Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• These are test tokens with no real value</li>
              <li>• Tokens are limited to prevent abuse</li>
              <li>• Cooldown periods apply between requests</li>
              <li>• For mainnet, you'll need real SDUPI tokens</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
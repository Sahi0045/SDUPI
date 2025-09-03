"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Send, Zap, Clock, AlertCircle, CheckCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { useSDUPIBlockchain } from '@/hooks/useSDUPIBlockchain';

export function TransactionForm() {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string>('0');
  const [gasPrice, setGasPrice] = useState<string>('20');
  
  const { 
    isConnected, 
    currentAccount, 
    sdupiBalance, 
    sendSDUPI,
    networkStats,
    isLoading 
  } = useSDUPIBlockchain();

  // Network configuration
  const networkConfig = {
    name: 'SDUPI Testnet',
    chainId: '1337',
    rpcUrl: 'http://localhost:8080',
    explorer: 'http://localhost:3000/explorer',
    gasLimit: '30000000',
    defaultGasPrice: '20'
  };

  // Auto-fill recipient address from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const to = urlParams.get('to');
    if (to) {
      setToAddress(to);
    }
  }, []);

  // Validate Ethereum address
  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  // Validate amount
  const validateAmount = (amt: string): boolean => {
    const num = parseFloat(amt);
    const balance = parseFloat(sdupiBalance || '0');
    return num > 0 && num <= balance;
  };

  // Calculate gas estimate (simplified)
  const calculateGasEstimate = (amount: string): string => {
    if (!amount || !validateAmount(amount)) return '0';
    
    const num = parseFloat(amount);
    // Base gas: 21,000 + additional gas based on amount
    const baseGas = 21000;
    const additionalGas = Math.floor(num / 1000) * 1000; // 1 gas per 1000 SDUPI
    return (baseGas + additionalGas).toString();
  };

  // Update gas estimate when amount changes
  useEffect(() => {
    const estimate = calculateGasEstimate(amount);
    setGasEstimate(estimate);
  }, [amount]);

  // Can submit transaction
  const canSubmit = (): boolean => {
    return isConnected && 
           validateAddress(toAddress) && 
           validateAmount(amount) && 
           !isSubmitting;
  };

  // Get transaction fee estimate
  const getTransactionFee = (): string => {
    const gas = parseInt(gasEstimate);
    const price = parseInt(gasPrice);
    const fee = (gas * price) / 1e9; // Convert from Gwei
    return fee.toFixed(6);
  };

  // Submit transaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Send transaction
      const txHash = await sendSDUPI(toAddress, amount);
      
      setSuccess(`Transaction submitted successfully! Hash: ${txHash}`);
      
      // Clear form after successful submission
      setTimeout(() => {
        setSuccess(null);
        setToAddress('');
        setAmount('');
      }, 10000);
      
    } catch (err) {
      console.error('Transaction failed:', err);
      setError('Transaction failed. Please check your balance and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount);
    }
  };

  // Open transaction in explorer
  const openExplorer = (hash: string) => {
    window.open(`${networkConfig.explorer}/tx/${hash}`, '_blank');
  };

  // Format balance for display
  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Send className="w-8 h-8 text-primary" />
          Send SDUPI Tokens
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transfer SDUPI tokens to other addresses on the testnet. 
          All transactions are processed in real-time with fast confirmation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Transaction Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              New Transaction
            </CardTitle>
            <CardDescription>
              Send SDUPI tokens to any address on the network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipient Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Address</label>
                <Input
                  placeholder="0x..."
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="font-mono"
                />
                {!validateAddress(toAddress) && toAddress && (
                  <p className="text-sm text-destructive">Invalid Ethereum address</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (SDUPI)</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.000001"
                  step="0.000001"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Available: {formatBalance(sdupiBalance || '0')} SDUPI</span>
                  {amount && !validateAmount(amount) && (
                    <span className="text-destructive">Insufficient balance</span>
                  )}
                </div>
              </div>

              {/* Gas Settings */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Gas Price (Gwei)</label>
                <Input
                  type="number"
                  placeholder="20"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  min="1"
                  max="100"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 20 Gwei for fast confirmation
                </p>
              </div>

              {/* Transaction Details */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gas Limit:</span>
                    <span className="font-mono">{parseInt(gasEstimate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gas Price:</span>
                    <span className="font-mono">{gasPrice} Gwei</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction Fee:</span>
                    <span className="font-mono">{getTransactionFee()} SDUPI</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total Cost:</span>
                    <span className="font-mono">
                      {amount ? (parseFloat(amount) + parseFloat(getTransactionFee())).toFixed(6) : '0'} SDUPI
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!canSubmit()}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send {amount || '0'} SDUPI
                  </>
                )}
              </Button>

              {/* Success/Error Messages */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                    {success.includes('Hash:') && (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-green-800 underline"
                        onClick={() => openExplorer(success.split('Hash: ')[1])}
                      >
                        View on Explorer
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Network Info & Wallet Status */}
        <div className="space-y-4">
          {/* Network Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Network Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge variant="outline">{networkConfig.name}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Chain ID:</span>
                <Badge variant="secondary">{networkConfig.chainId}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Block Height:</span>
                <Badge variant="outline">
                  {networkStats?.blockHeight || 'Loading...'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Network Health:</span>
                <Badge variant={networkStats?.networkHealth && networkStats.networkHealth > 95 ? "default" : "destructive"}>
                  {networkStats?.networkHealth || 'Loading...'}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Connected Wallet */}
          {isConnected && currentAccount ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <Badge variant="outline">
                    {formatBalance(sdupiBalance || '0')} SDUPI
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`${networkConfig.explorer}/address/${currentAccount}`, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wallet Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your wallet to send transactions
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <Send className="w-4 h-4 mr-2" />
                  Connect Wallet First
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Transaction Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Double-check the recipient address before sending</p>
              <p>• Gas price affects transaction confirmation speed</p>
              <p>• Higher gas price = faster confirmation</p>
              <p>• Transactions are irreversible once confirmed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
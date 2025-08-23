/**
 * 🚀 SDUPI Wallet Component
 * Complete wallet integration with SDUPI blockchain
 */

"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Send, Download, Upload, Coins, TrendingUp, Copy, ExternalLink } from 'lucide-react';
import useSDUPIBlockchain from '@/hooks/useSDUPIBlockchain';
import { SDUPI_CONFIG } from '@/lib/sdupi-blockchain';

export const SDUPIWallet: React.FC = () => {
  const {
    isConnected,
    currentAccount,
    sdupiBalance,
    networkStats,
    transactionHistory,
    stakingInfo,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    sendSDUPI,
    stakeSDUPI,
    refreshData
  } = useSDUPIBlockchain();

  const { toast } = useToast();
  
  // Local state
  const [sendAmount, setSendAmount] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showStakeDialog, setShowStakeDialog] = useState(false);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast({
        title: "✅ Wallet Connected!",
        description: "Your wallet is now connected to SDUPI blockchain.",
      });
    } catch (err) {
      toast({
        title: "❌ Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    disconnectWallet();
    toast({
      title: "🔌 Wallet Disconnected",
      description: "Your wallet has been disconnected from SDUPI blockchain.",
    });
  };

  // Handle sending SDUPI
  const handleSendSDUPI = async () => {
    if (!sendAmount || !sendTo) {
      toast({
        title: "❌ Invalid Input",
        description: "Please enter both amount and recipient address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const txHash = await sendSDUPI(sendTo, sendAmount);
      setShowSendDialog(false);
      setSendAmount('');
      setSendTo('');
      
      toast({
        title: "✅ SDUPI Sent!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
    } catch (err) {
      toast({
        title: "❌ Transaction Failed",
        description: "Failed to send SDUPI. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle staking SDUPI
  const handleStakeSDUPI = async () => {
    if (!stakeAmount) {
      toast({
        title: "❌ Invalid Input",
        description: "Please enter the amount to stake.",
        variant: "destructive",
      });
      return;
    }

    try {
      const txHash = await stakeSDUPI(stakeAmount);
      setShowStakeDialog(false);
      setStakeAmount('');
      
      toast({
        title: "✅ SDUPI Staked!",
        description: `Staking transaction: ${txHash.slice(0, 10)}...`,
      });
    } catch (err) {
      toast({
        title: "❌ Staking Failed",
        description: "Failed to stake SDUPI. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount);
      toast({
        title: "📋 Address Copied!",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format balance
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M SDUPI`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K SDUPI`;
    } else {
      return `${num.toFixed(2)} SDUPI`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      {!isConnected ? (
        <Card className="border-2 border-dashed border-primary/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Wallet className="h-16 w-16 mx-auto text-primary/50" />
              <div>
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your MetaMask wallet to start using SDUPI blockchain
                </p>
              </div>
              <Button onClick={handleConnectWallet} disabled={isLoading} size="lg">
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Connected Wallet */
        <div className="space-y-6">
          {/* Wallet Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">SDUPI Wallet</CardTitle>
                    <CardDescription>
                      Connected to {SDUPI_CONFIG.NETWORK_NAME}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={handleDisconnectWallet}>
                  Disconnect
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Account Info */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet Address</p>
                    <p className="font-mono text-sm">{formatAddress(currentAccount!)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* Balance */}
                <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatBalance(sdupiBalance)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    ≈ ${(parseFloat(sdupiBalance) * 0.50).toFixed(2)} USD
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setShowSendDialog(true)} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                  <Button onClick={() => setShowStakeDialog(true)} variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Stake
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transactions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="staking">Staking</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                </TabsList>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-4">
                  <div className="space-y-3">
                    {transactionHistory.length > 0 ? (
                      transactionHistory.map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              tx.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                              tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {tx.status === 'confirmed' ? '✓' : tx.status === 'pending' ? '⏳' : '✗'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {tx.status === 'confirmed' ? 'Sent' : tx.status === 'pending' ? 'Pending' : 'Failed'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">-{tx.value} SDUPI</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {tx.hash.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No transactions yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Staking Tab */}
                <TabsContent value="staking" className="space-y-4">
                  {stakingInfo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">Staked Amount</p>
                          <p className="text-xl font-bold">{formatBalance(stakingInfo.stakedAmount)}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">Rewards Earned</p>
                          <p className="text-xl font-bold text-green-600">{formatBalance(stakingInfo.rewards)}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Current APY</p>
                        <p className="text-2xl font-bold text-green-600">{stakingInfo.apy}%</p>
                        <p className="text-xs text-muted-foreground">
                          Earn rewards by staking your SDUPI tokens
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No staking information available</p>
                    </div>
                  )}
                </TabsContent>

                {/* Network Tab */}
                <TabsContent value="network" className="space-y-4">
                  {networkStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Network TPS</p>
                        <p className="text-xl font-bold text-primary">{networkStats.tps.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Latency</p>
                        <p className="text-xl font-bold">{networkStats.latency.toFixed(2)}ms</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Active Nodes</p>
                        <p className="text-xl font-bold">{networkStats.nodes.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Network Health</p>
                        <p className="text-xl font-bold text-green-600">{networkStats.networkHealth}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Loading network statistics...</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send SDUPI Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send SDUPI</DialogTitle>
            <DialogDescription>
              Transfer SDUPI tokens to another wallet address
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="send-amount">Amount (SDUPI)</Label>
              <Input
                id="send-amount"
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="send-to">Recipient Address</Label>
              <Input
                id="send-to"
                placeholder="0x..."
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSendSDUPI} disabled={isLoading} className="flex-1">
                {isLoading ? 'Sending...' : 'Send SDUPI'}
              </Button>
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stake SDUPI Dialog */}
      <Dialog open={showStakeDialog} onOpenChange={setShowStakeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stake SDUPI</DialogTitle>
            <DialogDescription>
              Stake your SDUPI tokens to earn rewards (15% APY)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stake-amount">Amount to Stake (SDUPI)</Label>
              <Input
                id="stake-amount"
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Staking Rewards:</strong> Earn 15% APY on staked tokens
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleStakeSDUPI} disabled={isLoading} className="flex-1">
                {isLoading ? 'Staking...' : 'Stake SDUPI'}
              </Button>
              <Button variant="outline" onClick={() => setShowStakeDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default SDUPIWallet;

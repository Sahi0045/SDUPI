/**
 * 🚀 SDUPI Blockchain Explorer Component
 * Real-time blockchain explorer with network monitoring
 * REAL DATA FROM BACKEND BLOCKCHAIN
 */

"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Blocks, 
  Activity, 
  Users, 
  Zap, 
  Clock, 
  Database, 
  Cpu, 
  TrendingUp,
  Globe,
  Shield,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useSDUPIBlockchain } from '@/hooks/useSDUPIBlockchain';
import { WalletConnectModal } from './wallet-connect-modal';
import { SDUPIFaucet } from './sdupi-faucet';
import { TransactionForm } from './transaction-form';

export const SDUPIExplorer: React.FC = () => {
  const { 
    networkStats, 
    getLatestBlocks, 
    getLatestTransactions, 
    getMempoolData,
    refreshData,
    isConnected,
    currentAccount,
    sdupiBalance
  } = useSDUPIBlockchain();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'block' | 'transaction' | 'address'>('transaction');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get real-time data - these will be reactive to state changes
  const latestBlocks = getLatestBlocks();
  const latestTransactions = getLatestTransactions();
  const mempoolData = getMempoolData();
  
  // Debug logging to see what data we're getting
  console.log('🔍 Explorer Component - networkStats:', networkStats);
  console.log('🔍 Explorer Component - latestBlocks:', latestBlocks);
  console.log('🔍 Explorer Component - latestTransactions:', latestTransactions);
  console.log('🔍 Explorer Component - mempoolData:', mempoolData);

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // In a real implementation, this would search the blockchain
    console.log(`Searching for ${searchType}: ${searchQuery}`);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Format hash for display
  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold">SDUPI Blockchain Explorer</h1>
          <p className="text-muted-foreground mt-2">
            Real-time blockchain data and network statistics
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Connected Wallet</p>
              <p className="font-mono text-sm">{formatAddress(currentAccount || '')}</p>
              <p className="text-xs text-muted-foreground">
                Balance: {parseFloat(sdupiBalance || '0').toLocaleString()} SDUPI
              </p>
            </div>
          )}
          <WalletConnectModal />
        </div>
              </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="search">Search Blockchain</Label>
              <Input
                id="search"
                placeholder="Enter block height, transaction hash, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-32">
              <Label htmlFor="search-type">Type</Label>
              <select
                id="search-type"
                className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
              >
                <option value="transaction">Transaction</option>
                <option value="block">Block</option>
                <option value="address">Address</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Blocks className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Blocks</p>
                <p className="text-2xl font-bold">
                  {networkStats?.blockHeight.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Latest: #{networkStats?.blockHeight || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">
                  {networkStats?.totalTransactions.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {networkStats?.tps.toLocaleString() || '0'} TPS
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Addresses</p>
                <p className="text-2xl font-bold">
                  {networkStats?.activeWallets.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {networkStats?.activeWallets || 0} contracts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mempool</p>
                <p className="text-2xl font-bold">
                  {mempoolData?.pendingCount.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pending transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Network TPS</p>
                <p className="text-2xl font-bold">
                  {networkStats?.tps.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latency</p>
                <p className="text-2xl font-bold">
                  {networkStats?.latency.toFixed(2) || '0'}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Nodes</p>
                <p className="text-2xl font-bold">
                  {networkStats?.nodes.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Network Health</p>
                <p className="text-2xl font-bold text-green-600">
                  {networkStats?.networkHealth.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Consensus Time</span>
                <span>{networkStats?.consensusTime || 0}ms</span>
              </div>
              <Progress value={((networkStats?.consensusTime || 0) / 10) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Block Height</span>
                <span>{networkStats?.blockHeight.toLocaleString() || '0'}</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Total Transactions</span>
                <span>{networkStats?.totalTransactions.toLocaleString() || '0'}</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Blocks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Blocks className="h-5 w-5" />
            Latest Blocks
          </CardTitle>
          <CardDescription>Most recently mined blocks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latestBlocks.length > 0 ? (
              latestBlocks.map((block, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Blocks className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold">#{block.height}</p>
                        <Badge variant="secondary">{block.transactions} txs</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {formatHash(block.hash)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mined by {formatAddress(block.miner)} • {formatTimestamp(block.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{block.size}</p>
                    <p className="text-muted-foreground">
                      Gas: {block.gasUsed} / {block.gasLimit}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading blocks...</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline">View All Blocks</Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Transactions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Latest Transactions
          </CardTitle>
          <CardDescription>Most recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latestTransactions.length > 0 ? (
              latestTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      tx.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {tx.status === 'confirmed' ? '✓' : tx.status === 'pending' ? '⏳' : '✗'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{formatHash(tx.hash)}</p>
                        <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                          {tx.status}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        {formatAddress(tx.from)} → {formatAddress(tx.to)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.block ? `Block #${tx.block}` : 'Pending'} • {formatTimestamp(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{tx.value} SDUPI</p>
                    <p className="text-sm text-muted-foreground">Gas: {tx.gas || '21,000'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading transactions...</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline">View All Transactions</Button>
          </div>
        </CardContent>
      </Card>

      {/* Mempool Status */}
      {mempoolData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Mempool Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Pending Transactions</p>
                <p className="text-2xl font-bold">{mempoolData.pendingCount.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Average Gas Price</p>
                <p className="text-2xl font-bold">{mempoolData.averageGasPrice}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Oldest Transaction</p>
                <p className="text-lg font-medium">
                  {formatTimestamp(mempoolData.oldestTransaction)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explorer Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="blocks" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="blocks">Latest Blocks</TabsTrigger>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="faucet">Token Faucet</TabsTrigger>
              <TabsTrigger value="send">Send Tokens</TabsTrigger>
              <TabsTrigger value="network">Network Stats</TabsTrigger>
            </TabsList>

            {/* Blocks Tab */}
            <TabsContent value="blocks" className="space-y-4">
              <div className="space-y-3">
                {latestBlocks.length > 0 ? (
                  latestBlocks.map((block, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Blocks className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-bold">#{block.height}</p>
                            <Badge variant="secondary">{block.transactions} txs</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {formatHash(block.hash)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Mined by {formatAddress(block.miner)} • {formatTimestamp(block.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{block.size}</p>
                        <p className="text-muted-foreground">
                          Gas: {block.gasUsed} / {block.gasLimit}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading blocks...</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-4">
              <div className="space-y-3">
                {latestTransactions.length > 0 ? (
                  latestTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          tx.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {tx.status === 'confirmed' ? '✓' : tx.status === 'pending' ? '⏳' : '✗'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{formatHash(tx.hash)}</p>
                            <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                              {tx.status}
                            </Badge>
                          </div>
                          <p className="text-sm">
                            {formatAddress(tx.from)} → {formatAddress(tx.to)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.block ? `Block #${tx.block}` : 'Pending'} • {formatTimestamp(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{tx.value} SDUPI</p>
                        <p className="text-sm text-muted-foreground">Gas: {tx.gas}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading transactions...</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Faucet Tab */}
            <TabsContent value="faucet" className="space-y-4">
              <SDUPIFaucet />
            </TabsContent>

            {/* Send Tokens Tab */}
            <TabsContent value="send" className="space-y-4">
              <TransactionForm />
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Network Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Target TPS</span>
                      <span className="text-sm font-medium">50,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current TPS</span>
                      <span className="text-sm font-medium text-primary">
                        {networkStats?.tps.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Target Latency</span>
                      <span className="text-sm font-medium">10ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current Latency</span>
                      <span className="text-sm font-medium text-primary">
                        {networkStats?.latency.toFixed(2) || '0'}ms
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Network Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Wallets</span>
                      <span className="text-sm font-medium">
                        {networkStats?.activeWallets.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Network Health</span>
                      <span className="text-sm font-medium text-green-600">
                        {networkStats?.networkHealth.toFixed(1) || '0'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Consensus Time</span>
                      <span className="text-sm font-medium">
                        {networkStats?.consensusTime || 0}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Block Height</span>
                      <span className="text-sm font-medium">
                        {networkStats?.blockHeight.toLocaleString() || '0'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SDUPIExplorer;

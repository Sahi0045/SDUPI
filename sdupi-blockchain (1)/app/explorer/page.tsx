"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
  RefreshCw,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  Wallet,
  Smartphone,
  FileText,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  Check,
  X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { SDUPIExplorer } from '@/components/sdupi-explorer'
import { RealTimeStatus } from '@/components/real-time-status'
import { NotificationSystem } from '@/components/notification-system'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileNav } from '@/components/mobile-nav'
import Link from 'next/link'

interface Block {
  number: number
  hash: string
  timestamp: number
  transactions: number
  gasUsed: string
  gasLimit: string
  miner: string
  difficulty: string
  totalDifficulty: string
  size: number
  baseFeePerGas: string
}

interface Transaction {
  hash: string
  blockNumber: number
  timestamp: number
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  gasUsed: string
  status: number
  confirmations: number
}

interface Address {
  address: string
  balance: string
  totalReceived: string
  totalSent: string
  transactionCount: number
  firstSeen: number
  lastSeen: number
  isContract: boolean
}

interface NetworkStats {
  totalBlocks: number
  totalTransactions: number
  totalAddresses: number
  totalContracts: number
  currentTPS: number
  averageBlockTime: number
  networkHashrate: number
  difficulty: number
  lastBlockTime: number
  mempoolSize: number
  gasPrice: string
  gasLimit: string
}

export default function SDUPIExplorerPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'block' | 'transaction' | 'address'>('transaction')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null)
  const [latestBlocks, setLatestBlocks] = useState<Block[]>([])
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([])
  const [mempoolData, setMempoolData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [sortBy, setSortBy] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // API base URL
  const API_BASE = 'http://localhost:3001/api'

  // Load initial data
  useEffect(() => {
    loadInitialData()
    setupWebSocket()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Load network stats
      const statsResponse = await fetch(`${API_BASE}/stats`)
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setNetworkStats(statsData.data)
      }

      // Load latest blocks
      const blocksResponse = await fetch(`${API_BASE}/blocks?limit=10`)
      const blocksData = await blocksResponse.json()
      if (blocksData.success) {
        setLatestBlocks(blocksData.data.blocks)
      }

      // Load latest transactions
      const txsResponse = await fetch(`${API_BASE}/transactions?limit=10`)
      const txsData = await txsResponse.json()
      if (txsData.success) {
        setLatestTransactions(txsData.data.transactions)
      }

      // Load mempool data
      const mempoolResponse = await fetch(`${API_BASE}/mempool`)
      const mempoolData = await mempoolResponse.json()
      if (mempoolData.success) {
        setMempoolData(mempoolData.data)
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
      toast({
        title: "Error",
        description: "Failed to load blockchain data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setupWebSocket = () => {
    const ws = new WebSocket('ws://localhost:3001')
    
    ws.onopen = () => {
      console.log('WebSocket connected to explorer')
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'network_stats':
            setNetworkStats(data.data)
            break
          case 'new_block':
            // Add new block to the list
            setLatestBlocks(prev => [data.data, ...prev.slice(0, 9)])
            break
          case 'new_transaction':
            // Add new transaction to the list
            setLatestTransactions(prev => [data.data, ...prev.slice(0, 9)])
            break
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      // Reconnect after 5 seconds
      setTimeout(setupWebSocket, 5000)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.data.results)
        if (data.data.results.length === 0) {
          toast({
            title: "No results found",
            description: `No results found for "${searchQuery}"`,
          })
        }
      } else {
        toast({
          title: "Search failed",
          description: data.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "Search error",
        description: "Failed to perform search",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const formatValue = (value: string) => {
    const ethValue = parseFloat(value) / 1e18
    return `${ethValue.toFixed(4)} SDUPI`
  }

  const formatGasPrice = (gasPrice: string) => {
    const gwei = parseFloat(gasPrice) / 1e9
    return `${gwei.toFixed(2)} Gwei`
  }

  const getTransactionStatus = (status: number) => {
    return status === 1 ? (
      <Badge variant="default" className="bg-green-500">
        <Check className="w-3 h-3 mr-1" />
        Success
      </Badge>
    ) : (
      <Badge variant="destructive">
        <X className="w-3 h-3 mr-1" />
        Failed
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav />
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">SDUPI Explorer</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Blockchain Explorer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <RealTimeStatus />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by Block Number, Transaction Hash, or Address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-4 py-3 text-lg"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="px-8"
              >
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {result.type}
                          </Badge>
                          <span className="font-mono">
                            {result.type === 'block' && `Block #${result.data.number}`}
                            {result.type === 'transaction' && formatHash(result.data.hash)}
                            {result.type === 'address' && formatAddress(result.data.address)}
                            {result.type === 'contract' && result.data.name}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="blocks">Blocks</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="mempool">Mempool</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Network Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
                  <Blocks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStats?.totalBlocks.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Latest: #{networkStats?.totalBlocks || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStats?.totalTransactions.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {networkStats?.currentTPS || 0} TPS
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStats?.totalAddresses.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {networkStats?.totalContracts || 0} contracts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mempool</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStats?.mempoolSize || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pending transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Latest Blocks and Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Blocks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Blocks className="w-5 h-5" />
                    Latest Blocks
                  </CardTitle>
                  <CardDescription>
                    Most recently mined blocks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {latestBlocks.map((block) => (
                      <div key={block.number} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Blocks className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">#{block.number}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatTimestamp(block.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {block.transactions} txs
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatHash(block.hash)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      View All Blocks
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Latest Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Latest Transactions
                  </CardTitle>
                  <CardDescription>
                    Most recent transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {latestTransactions.map((tx) => (
                      <div key={tx.hash} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {formatValue(tx.value)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTimestamp(tx.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatAddress(tx.from)} → {formatAddress(tx.to)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatHash(tx.hash)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      View All Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blocks Tab */}
          <TabsContent value="blocks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Blocks</CardTitle>
                <CardDescription>
                  Browse all blocks in the SDUPI blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestBlocks.map((block) => (
                    <div key={block.number} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">Block #{block.number}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimestamp(block.timestamp)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Transactions</div>
                        <div className="text-sm text-muted-foreground">
                          {block.transactions} txs
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Gas Used</div>
                        <div className="text-sm text-muted-foreground">
                          {parseInt(block.gasUsed).toLocaleString()} / {parseInt(block.gasLimit).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Miner</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {formatAddress(block.miner)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  Browse all transactions in the SDUPI blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestTransactions.map((tx) => (
                    <div key={tx.hash} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm">
                          {formatHash(tx.hash)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Block #{tx.blockNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">From</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {formatAddress(tx.from)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">To</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {formatAddress(tx.to)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Value</div>
                        <div className="text-sm text-muted-foreground">
                          {formatValue(tx.value)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Status</div>
                        <div className="text-sm">
                          {getTransactionStatus(tx.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mempool Tab */}
          <TabsContent value="mempool" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mempool</CardTitle>
                <CardDescription>
                  Pending transactions waiting to be mined
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mempoolData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{mempoolData.count}</div>
                        <div className="text-sm text-muted-foreground">Pending Transactions</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {formatGasPrice(mempoolData.totalGasPrice.toString())}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Gas Price</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {formatGasPrice((mempoolData.totalGasPrice / mempoolData.count).toString())}
                        </div>
                        <div className="text-sm text-muted-foreground">Average Gas Price</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {mempoolData.transactions.slice(0, 10).map((tx: any) => (
                        <div key={tx.hash} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-yellow-500" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">
                                {formatValue(tx.value)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTimestamp(tx.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {formatGasPrice(tx.gasPrice.toString())}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatHash(tx.hash)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Current TPS</span>
                        <span>{networkStats?.currentTPS || 0}</span>
                      </div>
                      <Progress value={networkStats?.currentTPS || 0} className="mt-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Average Block Time</span>
                        <span>{networkStats?.averageBlockTime || 0}s</span>
                      </div>
                      <Progress value={100 - (networkStats?.averageBlockTime || 0)} className="mt-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Network Hashrate</span>
                        <span>{(networkStats?.networkHashrate || 0).toLocaleString()} H/s</span>
                      </div>
                      <Progress value={50} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gas Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-green-600">Slow</div>
                        <div className="text-sm">15 Gwei</div>
                        <div className="text-xs text-muted-foreground">5-10 min</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">Standard</div>
                        <div className="text-sm">20 Gwei</div>
                        <div className="text-xs text-muted-foreground">2-5 min</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-orange-600">Fast</div>
                        <div className="text-sm">25 Gwei</div>
                        <div className="text-xs text-muted-foreground">30s-2min</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-red-600">Instant</div>
                        <div className="text-sm">30 Gwei</div>
                        <div className="text-xs text-muted-foreground">&lt;30s</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notification System */}
      <NotificationSystem />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Activity,
  Wallet,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Database,
  Cpu,
  Search,
  Code,
  Coins,
} from "lucide-react"
import { WalletConnectModal } from "@/components/wallet-connect-modal"
import { WalletInfoPanel } from "@/components/wallet-info-panel"
import { MobileNav } from "@/components/mobile-nav"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnalyticsChart } from "@/components/analytics-chart"
import { NotificationSystem } from "@/components/notification-system"
import useSDUPIBlockchain from "@/hooks/useSDUPIBlockchain"
import { RealTimeStatus } from "@/components/real-time-status"
import { WalletType } from "@/lib/sdupi-blockchain"

export default function SDUPIDashboard() {
  const { networkStats, realTimeData, refreshData, isConnected, error } = useSDUPIBlockchain()
  const [walletConnected, setWalletConnected] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null)

  // Use real data from backend instead of simulated data
  const data = networkStats ? {
    tps: networkStats.tps,
    latency: networkStats.latency,
    nodes: networkStats.nodes,
    consensusTime: networkStats.consensusTime,
    blockHeight: networkStats.blockHeight,
    totalTransactions: networkStats.totalTransactions,
    activeWallets: networkStats.activeWallets,
    networkHealth: networkStats.networkHealth,
  } : {
    tps: 0,
    latency: 0,
    nodes: 0,
    consensusTime: 0,
    blockHeight: 0,
    totalTransactions: 0,
    activeWallets: 0,
    networkHealth: 0,
  }

  const connectWallet = () => {
    if (walletConnected) {
      return
    }
    setShowWalletModal(true)
  }

  const handleWalletConnect = (walletId: WalletType) => {
    setConnectedWallet(walletId)
    setWalletConnected(true)
  }

  const handleWalletDisconnect = () => {
    setConnectedWallet(null)
    setWalletConnected(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav
                walletConnected={walletConnected}
                connectedWallet={connectedWallet}
                onConnectWallet={connectWallet}
              />
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">SDUPI</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Blockchain Platform</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {isConnected ? 'Connected to Testnet' : 'Disconnected'}
                  </span>
                  {error && (
                    <span className="text-xs text-red-500">({error})</span>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden lg:inline">Refresh</span>
              </Button>
              
              <Badge variant="outline" className="gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${networkStats ? 'bg-green-500' : 'bg-yellow-500'}`} />
                {networkStats ? 'Backend Connected' : 'Connecting to Backend...'}
              </Badge>

              <Link href="/explorer">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Search className="w-4 h-4" />
                  <span className="hidden lg:inline">Explorer</span>
                </Button>
              </Link>

              <Link href="/contracts">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Code className="w-4 h-4" />
                  <span className="hidden lg:inline">Contracts</span>
                </Button>
              </Link>

              <Link href="/defi">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Coins className="w-4 h-4" />
                  <span className="hidden lg:inline">DeFi</span>
                </Button>
              </Link>

              <ThemeToggle />
              <NotificationSystem />

              {walletConnected ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary" className="gap-2">
                      <Wallet className="w-4 h-4" />
                      <span className="hidden xl:inline">{connectedWallet} Connected</span>
                      <span className="xl:hidden">Connected</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>Wallet Management</SheetTitle>
                      <SheetDescription>Manage your SDUPI wallet and transactions</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <WalletInfoPanel
                        walletType={connectedWallet || "Unknown"}
                        onDisconnect={handleWalletDisconnect}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button onClick={connectWallet} className="gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <WalletConnectModal open={showWalletModal} onOpenChange={setShowWalletModal} onConnect={handleWalletConnect} />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            The World's Fastest Blockchain
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Experience enterprise-grade performance with 50,000+ TPS, sub-10ms latency, and military-grade security.
          </p>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">TPS</CardTitle>
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-primary">{data.tps.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="w-2 h-2 sm:w-3 sm:h-3 text-green-500" />
                +12%
              </p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Latency</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-secondary">{data.latency.toFixed(2)}ms</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowDownRight className="w-2 h-2 sm:w-3 sm:h-3 text-green-500" />
                -5%
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Nodes</CardTitle>
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-accent">{data.nodes}</div>
              <p className="text-xs text-muted-foreground">Global</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Consensus</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-primary">{data.consensusTime.toFixed(1)}ms</div>
              <p className="text-xs text-muted-foreground">Ultra-fast</p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Connection Status */}
        <div className="mb-6">
          <RealTimeStatus />
        </div>

        {/* Data Source Indicator */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {networkStats ? '🟢 Live Data from Backend' : '🟡 Connecting to Backend...'}
            </Badge>
            {networkStats && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                className="h-6 px-2 text-xs"
              >
                🔄 Refresh
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {networkStats ? 'Real-time blockchain data from http://localhost:8080' : 'Establishing connection...'}
          </p>
          {networkStats && (
            <p className="text-xs text-muted-foreground mt-1">
              📊 Last updated: {new Date().toLocaleTimeString()} | Data refreshes every 10 seconds
            </p>
          )}
        </div>

        {/* Advanced Analytics Section */}
        <div className="mb-6 sm:mb-8">
          <AnalyticsChart realTimeData={realTimeData} />
        </div>

        {/* Network Health & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Network Health
              </CardTitle>
              <CardDescription className="text-sm">Real-time network performance monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Health</span>
                  <span className="font-medium">{data.networkHealth.toFixed(1)}%</span>
                </div>
                <Progress value={data.networkHealth} className="h-2" />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Block Height</p>
                  <p className="font-medium">{data.blockHeight.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Transactions</p>
                  <p className="font-medium">{data.totalTransactions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                Platform Statistics
              </CardTitle>
              <CardDescription className="text-sm">User engagement and platform metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-secondary">
                    {data.activeWallets.toLocaleString()}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Wallets</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-primary">24/7</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Network Capacity</span>
                <Badge variant="secondary" className="text-xs">
                  Unlimited Scaling
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-sm">Get started with SDUPI blockchain platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-2 bg-transparent text-xs sm:text-sm"
                disabled={!walletConnected}
              >
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                Send SDUPI
              </Button>
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-2 bg-transparent text-xs sm:text-sm"
                disabled={!walletConnected}
              >
                <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6" />
                Receive SDUPI
              </Button>
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-2 bg-transparent text-xs sm:text-sm"
                disabled={!walletConnected}
              >
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                Stake Tokens
              </Button>
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-2 bg-transparent text-xs sm:text-sm"
                disabled={!walletConnected}
              >
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />
                Deploy Contract
              </Button>
              <Link href="/sdupi-dashboard">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-2 bg-transparent text-xs sm:text-sm w-full"
                >
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                  SDUPI Dashboard
                </Button>
              </Link>
            </div>
            {!walletConnected && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center px-4">
                Connect your wallet to access platform features
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

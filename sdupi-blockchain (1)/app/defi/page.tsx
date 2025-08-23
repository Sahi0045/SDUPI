"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  TrendingUp,
  Coins,
  Droplets,
  Vote,
  ArrowUpDown,
  Plus,
  Minus,
  Database,
  Shield,
  DollarSign,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface StakingPool {
  id: string
  name: string
  token: string
  apy: number
  totalStaked: number
  userStaked: number
  lockPeriod: number
  rewards: number
}

interface LiquidityPool {
  id: string
  name: string
  tokenA: string
  tokenB: string
  tvl: number
  apy: number
  userLiquidity: number
  volume24h: number
  fees24h: number
}

interface GovernanceProposal {
  id: string
  title: string
  description: string
  status: "active" | "passed" | "rejected" | "pending"
  votesFor: number
  votesAgainst: number
  endDate: Date
  quorum: number
}

// Mock data
const mockStakingPools: StakingPool[] = [
  {
    id: "sdupi-stake",
    name: "SDUPI Staking",
    token: "SDUPI",
    apy: 12.5,
    totalStaked: 2500000,
    userStaked: 1000,
    lockPeriod: 30,
    rewards: 125.5,
  },
  {
    id: "sdupi-eth",
    name: "SDUPI-ETH LP",
    token: "SDUPI-ETH",
    apy: 18.7,
    totalStaked: 1200000,
    userStaked: 500,
    lockPeriod: 60,
    rewards: 93.5,
  },
  {
    id: "governance",
    name: "Governance Staking",
    token: "vSDUPI",
    apy: 8.2,
    totalStaked: 800000,
    userStaked: 250,
    lockPeriod: 90,
    rewards: 20.5,
  },
]

const mockLiquidityPools: LiquidityPool[] = [
  {
    id: "sdupi-usdc",
    name: "SDUPI/USDC",
    tokenA: "SDUPI",
    tokenB: "USDC",
    tvl: 5200000,
    apy: 15.3,
    userLiquidity: 2500,
    volume24h: 850000,
    fees24h: 2550,
  },
  {
    id: "sdupi-eth",
    name: "SDUPI/ETH",
    tokenA: "SDUPI",
    tokenB: "ETH",
    tvl: 3800000,
    apy: 22.1,
    userLiquidity: 1800,
    volume24h: 620000,
    fees24h: 1860,
  },
  {
    id: "sdupi-btc",
    name: "SDUPI/BTC",
    tokenA: "SDUPI",
    tokenB: "BTC",
    tvl: 2100000,
    apy: 19.8,
    userLiquidity: 0,
    volume24h: 340000,
    fees24h: 1020,
  },
]

const mockProposals: GovernanceProposal[] = [
  {
    id: "prop-001",
    title: "Increase Staking Rewards by 2%",
    description: "Proposal to increase base staking rewards from 10% to 12% APY to incentivize more participation",
    status: "active",
    votesFor: 1250000,
    votesAgainst: 340000,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    quorum: 1000000,
  },
  {
    id: "prop-002",
    title: "Add New Trading Pair: SDUPI/MATIC",
    description: "Add SDUPI/MATIC trading pair to expand ecosystem reach",
    status: "passed",
    votesFor: 2100000,
    votesAgainst: 450000,
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    quorum: 1000000,
  },
]

export default function DeFiPage() {
  const { toast } = useToast()
  const [stakingPools, setStakingPools] = useState<StakingPool[]>(mockStakingPools)
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>(mockLiquidityPools)
  const [proposals, setProposals] = useState<GovernanceProposal[]>(mockProposals)
  const [stakeAmount, setStakeAmount] = useState("")
  const [swapFromAmount, setSwapFromAmount] = useState("")
  const [swapFromToken, setSwapFromToken] = useState("SDUPI")
  const [swapToToken, setSwapToToken] = useState("USDC")
  const [liquidityAmountA, setLiquidityAmountA] = useState("")
  const [liquidityAmountB, setLiquidityAmountB] = useState("")

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStakingPools((prev) =>
        prev.map((pool) => ({
          ...pool,
          apy: Math.max(5, pool.apy + (Math.random() * 2 - 1)),
          totalStaked: pool.totalStaked + Math.floor(Math.random() * 1000 - 500),
          rewards: pool.rewards + Math.random() * 0.1,
        })),
      )

      setLiquidityPools((prev) =>
        prev.map((pool) => ({
          ...pool,
          apy: Math.max(8, pool.apy + (Math.random() * 2 - 1)),
          tvl: pool.tvl + Math.floor(Math.random() * 10000 - 5000),
          volume24h: pool.volume24h + Math.floor(Math.random() * 5000 - 2500),
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleStake = (poolId: string) => {
    if (!stakeAmount) {
      toast({
        title: "Enter amount",
        description: "Please enter an amount to stake",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Staking successful",
      description: `Staked ${stakeAmount} tokens successfully`,
    })
    setStakeAmount("")
  }

  const handleSwap = () => {
    if (!swapFromAmount) {
      toast({
        title: "Enter amount",
        description: "Please enter an amount to swap",
        variant: "destructive",
      })
      return
    }

    const rate = 2.34 // Mock exchange rate
    const toAmount = (Number.parseFloat(swapFromAmount) * rate).toFixed(4)

    toast({
      title: "Swap successful",
      description: `Swapped ${swapFromAmount} ${swapFromToken} for ${toAmount} ${swapToToken}`,
    })
    setSwapFromAmount("")
  }

  const handleAddLiquidity = (poolId: string) => {
    if (!liquidityAmountA || !liquidityAmountB) {
      toast({
        title: "Enter amounts",
        description: "Please enter amounts for both tokens",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Liquidity added",
      description: `Added ${liquidityAmountA} and ${liquidityAmountB} to liquidity pool`,
    })
    setLiquidityAmountA("")
    setLiquidityAmountB("")
  }

  const handleVote = (proposalId: string, vote: "for" | "against") => {
    toast({
      title: "Vote cast",
      description: `Voted ${vote} on proposal ${proposalId}`,
    })
  }

  const getStatusBadge = (status: GovernanceProposal["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "passed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Passed
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const totalTVL = liquidityPools.reduce((sum, pool) => sum + pool.tvl, 0)
  const totalStaked = stakingPools.reduce((sum, pool) => sum + pool.totalStaked, 0)
  const totalRewards = stakingPools.reduce((sum, pool) => sum + pool.rewards, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground">SDUPI DeFi</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Decentralized Finance</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="gap-2 text-xs">
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">Audited</span>
              </Badge>
              <Badge variant="secondary" className="gap-2 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span className="hidden sm:inline">${totalTVL.toLocaleString()}</span>
                <span className="sm:hidden">TVL</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* DeFi Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">TVL</CardTitle>
              <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-primary">${totalTVL.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All pools</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Staked</CardTitle>
              <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-secondary">{totalStaked.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">SDUPI tokens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Rewards</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-accent">{totalRewards.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Claimable</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Proposals</CardTitle>
              <Vote className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-primary">
                {proposals.filter((p) => p.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Active votes</p>
            </CardContent>
          </Card>
        </div>

        {/* DeFi Features */}
        <Tabs defaultValue="staking" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[500px] sm:min-w-0">
              <TabsTrigger value="staking" className="text-xs sm:text-sm">
                Staking
              </TabsTrigger>
              <TabsTrigger value="liquidity" className="text-xs sm:text-sm">
                Liquidity
              </TabsTrigger>
              <TabsTrigger value="swap" className="text-xs sm:text-sm">
                Swap
              </TabsTrigger>
              <TabsTrigger value="governance" className="text-xs sm:text-sm">
                Governance
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="staking">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                      Staking Pools
                    </CardTitle>
                    <CardDescription className="text-sm">Stake your tokens to earn rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stakingPools.map((pool) => (
                        <div key={pool.id} className="border rounded-lg p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-sm sm:text-base">{pool.name}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">{pool.token}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-base sm:text-lg font-bold text-primary">{pool.apy.toFixed(1)}%</div>
                              <p className="text-xs text-muted-foreground">APY</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-muted-foreground">Total Staked</p>
                              <p className="font-medium">{pool.totalStaked.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Your Stake</p>
                              <p className="font-medium">{pool.userStaked.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Lock Period</p>
                              <p className="font-medium">{pool.lockPeriod} days</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" className="flex-1 text-xs sm:text-sm">
                                  <Plus className="w-3 h-3 mr-1" />
                                  Stake
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="w-[95vw] max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-base sm:text-lg">Stake {pool.token}</DialogTitle>
                                  <DialogDescription className="text-sm">
                                    Stake your {pool.token} tokens to earn {pool.apy.toFixed(1)}% APY
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm">Amount to Stake</Label>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={stakeAmount}
                                      onChange={(e) => setStakeAmount(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={() => handleStake(pool.id)} className="flex-1 text-sm">
                                      Stake Tokens
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setStakeAmount("1000")}
                                      className="text-sm"
                                    >
                                      Max
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {pool.userStaked > 0 && (
                              <Button size="sm" variant="outline" className="text-xs sm:text-sm bg-transparent">
                                <Minus className="w-3 h-3 mr-1" />
                                Unstake
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Your Staking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {stakingPools.reduce((sum, pool) => sum + pool.userStaked, 0).toLocaleString()}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Staked</p>
                    </div>

                    <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-secondary">{totalRewards.toFixed(2)}</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Pending Rewards</p>
                    </div>

                    <Button className="w-full text-sm">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Claim All Rewards
                    </Button>

                    <Separator />

                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span>Daily Rewards</span>
                        <span className="font-medium">12.5 SDUPI</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Rewards</span>
                        <span className="font-medium">375 SDUPI</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="liquidity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
                  Liquidity Pools
                </CardTitle>
                <CardDescription className="text-sm">Provide liquidity to earn trading fees</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pool</TableHead>
                      <TableHead>TVL</TableHead>
                      <TableHead>APY</TableHead>
                      <TableHead>24h Volume</TableHead>
                      <TableHead>Your Liquidity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liquidityPools.map((pool) => (
                      <TableRow key={pool.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Droplets className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{pool.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {pool.tokenA}/{pool.tokenB}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${pool.tvl.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pool.apy.toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div>${pool.volume24h.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {pool.userLiquidity > 0 ? `$${pool.userLiquidity.toLocaleString()}` : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Liquidity to {pool.name}</DialogTitle>
                                  <DialogDescription>
                                    Add liquidity to earn {pool.apy.toFixed(1)}% APY from trading fees
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>{pool.tokenA} Amount</Label>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={liquidityAmountA}
                                      onChange={(e) => setLiquidityAmountA(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{pool.tokenB} Amount</Label>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={liquidityAmountB}
                                      onChange={(e) => setLiquidityAmountB(e.target.value)}
                                    />
                                  </div>
                                  <Button onClick={() => handleAddLiquidity(pool.id)} className="w-full">
                                    Add Liquidity
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {pool.userLiquidity > 0 && (
                              <Button size="sm" variant="outline">
                                <Minus className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swap">
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    Token Swap
                  </CardTitle>
                  <CardDescription className="text-sm">Swap tokens instantly at the best rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">From</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={swapFromAmount}
                        onChange={(e) => setSwapFromAmount(e.target.value)}
                        className="flex-1"
                      />
                      <Select value={swapFromToken} onValueChange={setSwapFromToken}>
                        <SelectTrigger className="w-20 sm:w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SDUPI">SDUPI</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const temp = swapFromToken
                        setSwapFromToken(swapToToken)
                        setSwapToToken(temp)
                      }}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">To</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={swapFromAmount ? (Number.parseFloat(swapFromAmount) * 2.34).toFixed(4) : ""}
                        readOnly
                        className="flex-1"
                      />
                      <Select value={swapToToken} onValueChange={setSwapToToken}>
                        <SelectTrigger className="w-20 sm:w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SDUPI">SDUPI</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Exchange Rate</span>
                      <span>
                        1 {swapFromToken} = 2.34 {swapToToken}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trading Fee</span>
                      <span>0.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price Impact</span>
                      <span className="text-green-600">{"<0.01%"}</span>
                    </div>
                  </div>

                  <Button onClick={handleSwap} className="w-full">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Swap Tokens
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="governance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Vote className="w-4 h-4 sm:w-5 sm:h-5" />
                  Governance Proposals
                </CardTitle>
                <CardDescription className="text-sm">Vote on protocol improvements and changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm sm:text-base">{proposal.title}</h3>
                          {getStatusBadge(proposal.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>For: {proposal.votesFor.toLocaleString()}</span>
                          <span>Against: {proposal.votesAgainst.toLocaleString()}</span>
                        </div>
                        <Progress
                          value={(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Quorum: {proposal.quorum.toLocaleString()} votes</span>
                        <span>
                          {proposal.status === "active"
                            ? `Ends ${proposal.endDate.toLocaleDateString()}`
                            : `Ended ${proposal.endDate.toLocaleDateString()}`}
                        </span>
                      </div>

                      {proposal.status === "active" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleVote(proposal.id, "for")} className="flex-1 text-sm">
                            Vote For
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(proposal.id, "against")}
                            className="flex-1 text-sm"
                          >
                            Vote Against
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Protocol Metrics</CardTitle>
                  <CardDescription className="text-sm">Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">${totalTVL.toLocaleString()}</div>
                      <p className="text-sm sm:text-base text-muted-foreground">Total Value Locked</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl sm:text-3xl font-bold text-secondary">
                        ${liquidityPools.reduce((sum, pool) => sum + pool.volume24h, 0).toLocaleString()}
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground">24h Volume</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base">Active Users (24h)</span>
                      <span className="font-medium">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base">Total Transactions</span>
                      <span className="font-medium">1,247,392</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base">Protocol Revenue (24h)</span>
                      <span className="font-medium">$12,450</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Your DeFi Portfolio</CardTitle>
                  <CardDescription className="text-sm">Your positions across all protocols</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">
                      $
                      {(
                        stakingPools.reduce((sum, pool) => sum + pool.userStaked, 0) * 2.34 +
                        liquidityPools.reduce((sum, pool) => sum + pool.userLiquidity, 0)
                      ).toLocaleString()}
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">Total Portfolio Value</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base">Staking Positions</span>
                      <span className="font-medium">
                        ${(stakingPools.reduce((sum, pool) => sum + pool.userStaked, 0) * 2.34).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base">Liquidity Positions</span>
                      <span className="font-medium">
                        ${liquidityPools.reduce((sum, pool) => sum + pool.userLiquidity, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base">Pending Rewards</span>
                      <span className="font-medium text-green-600">{totalRewards.toFixed(2)} SDUPI</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Activity className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

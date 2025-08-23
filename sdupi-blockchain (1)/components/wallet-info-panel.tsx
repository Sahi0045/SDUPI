"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Copy, Send, Download, History, Settings, Eye, EyeOff, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WalletInfoPanelProps {
  walletType: string
  onDisconnect: () => void
}

export function WalletInfoPanel({ walletType, onDisconnect }: WalletInfoPanelProps) {
  const { toast } = useToast()
  const [balance, setBalance] = useState(1247.89)
  const [address] = useState("0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4")
  const [showBalance, setShowBalance] = useState(true)
  const [sendAmount, setSendAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")

  // Simulate balance updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance((prev) => prev + (Math.random() * 10 - 5))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const handleSend = () => {
    if (!sendAmount || !recipientAddress) {
      toast({
        title: "Missing information",
        description: "Please enter both amount and recipient address",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Transaction initiated",
      description: `Sending ${sendAmount} SDUPI to ${recipientAddress.slice(0, 10)}...`,
    })

    // Reset form
    setSendAmount("")
    setRecipientAddress("")
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              {walletType} Wallet
            </div>
            <Badge variant="secondary" className="text-xs">
              Connected
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm">Manage your SDUPI tokens and transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">SDUPI Balance</p>
              <div className="flex items-center gap-2">
                <p className="text-xl sm:text-2xl font-bold">
                  {showBalance ? `${balance.toFixed(2)} SDUPI` : "••••••"}
                </p>
                <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)} className="h-6 w-6 p-0">
                  {showBalance ? (
                    <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-muted-foreground">USD Value</p>
              <p className="text-base sm:text-lg font-medium">
                {showBalance ? `$${(balance * 2.34).toFixed(2)}` : "••••••"}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="text-sm">Wallet Address</Label>
            <div className="flex items-center gap-2">
              <Input value={address} readOnly className="font-mono text-xs sm:text-sm" />
              <Button variant="outline" size="sm" onClick={copyAddress} className="flex-shrink-0 bg-transparent">
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            Send SDUPI
          </CardTitle>
          <CardDescription className="text-sm">Transfer tokens to another wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-sm">
              Recipient Address
            </Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">
              Amount (SDUPI)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSend} className="flex-1 text-sm">
              Send Transaction
            </Button>
            <Button variant="outline" size="sm" className="text-sm bg-transparent">
              Max
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button variant="outline" className="flex items-center gap-2 text-xs sm:text-sm bg-transparent">
              <History className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Transaction History</span>
              <span className="sm:hidden">History</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 text-xs sm:text-sm bg-transparent">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 text-xs sm:text-sm bg-transparent">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Wallet Settings</span>
              <span className="sm:hidden">Settings</span>
            </Button>
            <Button
              variant="outline"
              onClick={onDisconnect}
              className="flex items-center gap-2 text-xs sm:text-sm bg-transparent"
            >
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

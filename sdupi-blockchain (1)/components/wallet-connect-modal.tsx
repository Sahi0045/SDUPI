"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wallet, Smartphone, HardDrive, Globe, CheckCircle, AlertCircle, Shield, Zap } from "lucide-react"
import useSDUPIBlockchain from "@/hooks/useSDUPIBlockchain"
import { WalletType } from "@/lib/sdupi-blockchain"

interface WalletOption {
  id: WalletType
  name: string
  icon: React.ReactNode
  description: string
  status: "available" | "unavailable" | "coming-soon"
}

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (walletId: string) => void
}

export function WalletConnectModal({ open, onOpenChange, onConnect }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null)
  const { blockchain } = useSDUPIBlockchain()

  // Get available wallet providers
  const availableProviders = blockchain.getAvailableWalletProviders()

  const walletOptions: WalletOption[] = [
    {
      id: WalletType.METAMASK,
      name: "MetaMask",
      icon: <Wallet className="w-6 h-6" />,
      description: "Connect using MetaMask browser extension",
      status: availableProviders.some(p => p.id === WalletType.METAMASK) ? "available" : "unavailable",
    },
    {
      id: WalletType.PHANTOM,
      name: "Phantom",
      icon: <Shield className="w-6 h-6" />,
      description: "Connect using Phantom wallet",
      status: availableProviders.some(p => p.id === WalletType.PHANTOM) ? "available" : "unavailable",
    },
    {
      id: WalletType.BRAVE,
      name: "Brave Wallet",
      icon: <Zap className="w-6 h-6" />,
      description: "Connect using Brave browser wallet",
      status: availableProviders.some(p => p.id === WalletType.BRAVE) ? "available" : "unavailable",
    },
    {
      id: WalletType.SDUPI_NATIVE,
      name: "SDUPI Wallet",
      icon: <Globe className="w-6 h-6" />,
      description: "Use built-in SDUPI wallet (demo mode)",
      status: "available",
    },
    {
      id: WalletType.WALLETCONNECT,
      name: "WalletConnect",
      icon: <Smartphone className="w-6 h-6" />,
      description: "Connect using mobile wallet apps",
      status: "coming-soon",
    },
    {
      id: WalletType.LEDGER,
      name: "Ledger",
      icon: <HardDrive className="w-6 h-6" />,
      description: "Connect using Ledger hardware wallet",
      status: "coming-soon",
    },
  ]

  const handleConnect = async (walletId: WalletType) => {
    setConnecting(walletId)

    try {
      if (walletId === WalletType.SDUPI_NATIVE) {
        // Demo mode - simulate connection
        await new Promise((resolve) => setTimeout(resolve, 1000))
        onConnect(walletId)
      } else if (availableProviders.some(p => p.id === walletId)) {
        // Connect to real wallet
        await blockchain.connectWalletType(walletId)
        onConnect(walletId)
      } else {
        throw new Error("Wallet connection not implemented yet")
      }
      
      setConnecting(null)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setConnecting(null)
      // Don't close modal on error so user can try again
    }
  }

  const getStatusIcon = (status: WalletOption["status"]) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "unavailable":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "coming-soon":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: WalletOption["status"]) => {
    switch (status) {
      case "available":
        return "Available"
      case "unavailable":
        return "Not Available"
      case "coming-soon":
        return "Coming Soon"
      default:
        return "Unknown"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to SDUPI Blockchain
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          {walletOptions.map((wallet) => (
            <Card key={wallet.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {wallet.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{wallet.name}</h3>
                      <p className="text-sm text-muted-foreground">{wallet.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={wallet.status === "available" ? "default" : "secondary"}>
                      {getStatusText(wallet.status)}
                    </Badge>
                    {getStatusIcon(wallet.status)}
                  </div>
                </div>
                
                {wallet.status === "available" && (
                  <Button
                    onClick={() => handleConnect(wallet.id)}
                    disabled={connecting === wallet.id}
                    className="w-full mt-3"
                  >
                    {connecting === wallet.id ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Separator />
        
        <div className="text-center text-sm text-muted-foreground">
          <p>By connecting a wallet, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

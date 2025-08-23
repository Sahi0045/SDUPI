"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Menu, Database, Search, Code, Coins, Wallet } from "lucide-react"
import Link from "next/link"

import { WalletType } from "@/lib/sdupi-blockchain"

interface MobileNavProps {
  walletConnected: boolean
  connectedWallet: WalletType | null
  onConnectWallet: () => void
}

export function MobileNav({ walletConnected, connectedWallet, onConnectWallet }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Dashboard", icon: Database },
    { href: "/explorer", label: "Explorer", icon: Search },
    { href: "/contracts", label: "Contracts", icon: Code },
    { href: "/defi", label: "DeFi", icon: Coins },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[300px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            SDUPI Platform
          </SheetTitle>
          <SheetDescription>Navigate the blockchain platform</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          <Separator />

          <div className="space-y-3">
            <Badge variant="outline" className="gap-2 w-full justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Network Online
            </Badge>

            {walletConnected ? (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Wallet Connected</span>
                </div>
                <p className="text-xs text-muted-foreground">{connectedWallet}</p>
              </div>
            ) : (
              <Button onClick={onConnectWallet} className="w-full gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Code,
  Database,
  Play,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Copy,
  FileText,
  Zap,
  Shield,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface SmartContract {
  address: string
  name: string
  compiler: string
  verified: boolean
  transactions: number
  balance: number
  createdAt: Date
  creator: string
}

interface ContractFunction {
  name: string
  type: "read" | "write"
  inputs: { name: string; type: string }[]
  outputs: { name: string; type: string }[]
  payable: boolean
}

interface ContractEvent {
  name: string
  blockNumber: number
  transactionHash: string
  timestamp: Date
  data: Record<string, any>
}

// Mock data
const generateMockContracts = (): SmartContract[] => {
  return [
    {
      address: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
      name: "SDUPI Token",
      compiler: "Solidity 0.8.19",
      verified: true,
      transactions: 15420,
      balance: 0,
      createdAt: new Date("2024-01-15"),
      creator: "0x123...abc",
    },
    {
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      name: "Staking Pool",
      compiler: "Solidity 0.8.19",
      verified: true,
      transactions: 8934,
      balance: 125000,
      createdAt: new Date("2024-02-01"),
      creator: "0x456...def",
    },
    {
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      name: "DEX Router",
      compiler: "Solidity 0.8.19",
      verified: false,
      transactions: 23567,
      balance: 0,
      createdAt: new Date("2024-02-15"),
      creator: "0x789...ghi",
    },
  ]
}

const mockFunctions: ContractFunction[] = [
  {
    name: "balanceOf",
    type: "read",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
  },
  {
    name: "transfer",
    type: "write",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    payable: false,
  },
  {
    name: "stake",
    type: "write",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    payable: true,
  },
]

const mockEvents: ContractEvent[] = [
  {
    name: "Transfer",
    blockNumber: 2847392,
    transactionHash: "0x123...abc",
    timestamp: new Date(),
    data: { from: "0x123...abc", to: "0x456...def", value: "1000000000000000000" },
  },
  {
    name: "Stake",
    blockNumber: 2847391,
    transactionHash: "0x456...def",
    timestamp: new Date(Date.now() - 30000),
    data: { user: "0x789...ghi", amount: "5000000000000000000" },
  },
]

export default function SmartContractsPage() {
  const { toast } = useToast()
  const [contracts, setContracts] = useState<SmartContract[]>(generateMockContracts())
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null)
  const [contractCode, setContractCode] = useState("")
  const [contractName, setContractName] = useState("")
  const [constructorArgs, setConstructorArgs] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({})

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    })
  }

  const formatAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-6)}`

  const handleDeploy = async () => {
    if (!contractCode || !contractName) {
      toast({
        title: "Missing information",
        description: "Please provide contract code and name",
        variant: "destructive",
      })
      return
    }

    setIsDeploying(true)

    // Simulate deployment
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const newContract: SmartContract = {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      name: contractName,
      compiler: "Solidity 0.8.19",
      verified: false,
      transactions: 0,
      balance: 0,
      createdAt: new Date(),
      creator: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
    }

    setContracts((prev) => [newContract, ...prev])
    setIsDeploying(false)
    setContractCode("")
    setContractName("")
    setConstructorArgs("")

    toast({
      title: "Contract deployed successfully",
      description: `Contract deployed at ${formatAddress(newContract.address)}`,
    })
  }

  const handleFunctionCall = async (func: ContractFunction) => {
    toast({
      title: `${func.type === "read" ? "Reading" : "Executing"} function`,
      description: `${func.name} function ${func.type === "read" ? "called" : "executed"} successfully`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground">SDUPI Contracts</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Smart Contract Interface</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="gap-2 text-xs">
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">Secure</span>
              </Badge>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2 text-xs sm:text-sm">
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Deploy Contract</span>
                    <span className="sm:hidden">Deploy</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">Deploy Smart Contract</DialogTitle>
                    <DialogDescription className="text-sm">
                      Deploy a new smart contract to the SDUPI blockchain
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contract-name" className="text-sm">
                        Contract Name
                      </Label>
                      <Input
                        id="contract-name"
                        placeholder="MyContract"
                        value={contractName}
                        onChange={(e) => setContractName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract-code" className="text-sm">
                        Contract Code (Solidity)
                      </Label>
                      <Textarea
                        id="contract-code"
                        placeholder="pragma solidity ^0.8.0;&#10;&#10;contract MyContract {&#10;    // Your contract code here&#10;}"
                        value={contractCode}
                        onChange={(e) => setContractCode(e.target.value)}
                        className="min-h-[150px] sm:min-h-[200px] font-mono text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="constructor-args" className="text-sm">
                        Constructor Arguments (optional)
                      </Label>
                      <Input
                        id="constructor-args"
                        placeholder="arg1, arg2, arg3"
                        value={constructorArgs}
                        onChange={(e) => setConstructorArgs(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleDeploy} disabled={isDeploying} className="flex-1 text-sm">
                        {isDeploying ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Deploy Contract
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Contracts</CardTitle>
              <Code className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-primary">{contracts.length.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Deployed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-500">
                {contracts.filter((c) => c.verified).length}
              </div>
              <p className="text-xs text-muted-foreground">Source verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Transactions</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-secondary">
                {contracts.reduce((sum, c) => sum + c.transactions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Efficiency</CardTitle>
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-accent">98.5%</div>
              <p className="text-xs text-muted-foreground">Gas efficiency</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Smart Contracts
                </CardTitle>
                <CardDescription className="text-sm">Deployed contracts on SDUPI blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {contracts.map((contract) => (
                  <div
                    key={contract.address}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedContract?.address === contract.address ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedContract(contract)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm sm:text-base">{contract.name}</h3>
                      {contract.verified ? (
                        <Badge variant="secondary" className="text-green-700 bg-green-100 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Verified</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-700 bg-yellow-100 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Unverified</span>
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{formatAddress(contract.address)}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(contract.address)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>{contract.transactions.toLocaleString()} transactions</div>
                      <div>{contract.balance.toLocaleString()} SDUPI</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contract Details */}
          <div className="lg:col-span-2">
            {selectedContract ? (
              <Tabs defaultValue="functions" className="space-y-6">
                <div className="overflow-x-auto">
                  <TabsList className="grid w-full grid-cols-4 min-w-[400px] sm:min-w-0">
                    <TabsTrigger value="functions" className="text-xs sm:text-sm">
                      Functions
                    </TabsTrigger>
                    <TabsTrigger value="events" className="text-xs sm:text-sm">
                      Events
                    </TabsTrigger>
                    <TabsTrigger value="code" className="text-xs sm:text-sm">
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="functions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contract Functions</CardTitle>
                      <CardDescription>Interact with {selectedContract.name} contract functions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockFunctions.map((func, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={func.type === "read" ? "secondary" : "default"}>{func.type}</Badge>
                              <code className="font-medium">{func.name}</code>
                              {func.payable && <Badge variant="outline">payable</Badge>}
                            </div>
                            <Button
                              size="sm"
                              variant={func.type === "read" ? "outline" : "default"}
                              onClick={() => handleFunctionCall(func)}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              {func.type === "read" ? "Query" : "Execute"}
                            </Button>
                          </div>

                          {func.inputs.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Inputs:</Label>
                              {func.inputs.map((input, inputIndex) => (
                                <div key={inputIndex} className="flex gap-2">
                                  <Input
                                    placeholder={`${input.name} (${input.type})`}
                                    value={functionInputs[`${func.name}_${input.name}`] || ""}
                                    onChange={(e) =>
                                      setFunctionInputs((prev) => ({
                                        ...prev,
                                        [`${func.name}_${input.name}`]: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="events">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contract Events</CardTitle>
                      <CardDescription>Recent events emitted by this contract</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Block</TableHead>
                            <TableHead>Transaction</TableHead>
                            <TableHead>Age</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockEvents.map((event, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{event.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {Object.entries(event.data).map(([key, value]) => (
                                      <div key={key}>
                                        {key}:{" "}
                                        {typeof value === "string" && value.startsWith("0x")
                                          ? formatAddress(value)
                                          : value.toString()}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{event.blockNumber}</Badge>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs">{formatAddress(event.transactionHash)}</code>
                              </TableCell>
                              <TableCell>{Math.floor((Date.now() - event.timestamp.getTime()) / 1000)}s ago</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="code">
                  <Card>
                    <CardHeader>
                      <CardTitle>Source Code</CardTitle>
                      <CardDescription>
                        {selectedContract.verified ? "Verified source code" : "Source code not available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedContract.verified ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                            <span className="text-sm text-muted-foreground">Compiler: {selectedContract.compiler}</span>
                          </div>
                          <Textarea
                            readOnly
                            value={`pragma solidity ^0.8.0;

contract ${selectedContract.name} {
    mapping(address => uint256) private _balances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    // Additional functions...
}`}
                            className="min-h-[400px] font-mono text-sm"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-base sm:text-lg font-medium mb-2">Source Code Not Verified</h3>
                          <p className="text-muted-foreground mb-4">
                            The source code for this contract has not been verified yet.
                          </p>
                          <Button variant="outline">
                            <Shield className="w-4 h-4 mr-2" />
                            Verify Contract
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contract Analytics</CardTitle>
                      <CardDescription>Usage statistics and performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {selectedContract.transactions.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Total Transactions</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-secondary">
                            {selectedContract.balance.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">SDUPI Balance</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Contract Address</span>
                          <code className="text-sm">{formatAddress(selectedContract.address)}</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Creator</span>
                          <code className="text-sm">{formatAddress(selectedContract.creator)}</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Created</span>
                          <span className="text-sm">{selectedContract.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Compiler</span>
                          <span className="text-sm">{selectedContract.compiler}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium mb-2">Select a Contract</h3>
                    <p className="text-muted-foreground text-sm px-4">
                      Choose a smart contract from the list to view its details and interact with it.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

# 🚀 SDUPI Testnet Release

## Overview

Welcome to the **SDUPI Testnet** - a revolutionary blockchain platform featuring high-performance consensus, real-time transaction processing, and a comprehensive Etherscan-like blockchain explorer.

## 🌟 Key Features

### Blockchain Features
- **High TPS**: 50,000+ transactions per second
- **Fast Block Time**: 12-second block confirmation
- **Proof of Stake**: Energy-efficient consensus mechanism
- **Smart Contracts**: Full EVM compatibility
- **Cross-chain Bridge**: Interoperability with major blockchains

### Explorer Features
- **Real-time Data**: Live blockchain monitoring
- **Advanced Search**: Search by block, transaction, address, or contract
- **Transaction Tracking**: Detailed transaction history and status
- **Address Analytics**: Comprehensive address information
- **Mempool Monitoring**: Real-time pending transaction tracking
- **Gas Tracker**: Dynamic gas price recommendations
- **Token Explorer**: ERC-20 token information and holders
- **Network Statistics**: Live network performance metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Git
- 4GB RAM minimum
- 10GB free disk space

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sdupi/testnet.git
cd SDUPI
```

2. **Install dependencies**
```bash
pnpm run install:all
```

3. **Deploy the testnet**
```bash
chmod +x deploy-testnet-complete.sh
./deploy-testnet-complete.sh
```

### Access Points

Once deployed, you can access:

- **Main Dashboard**: http://localhost:3000
- **Blockchain Explorer**: http://localhost:3000/explorer
- **API Documentation**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3001

## 📊 Network Information

| Parameter | Value |
|-----------|-------|
| Network Name | SDUPI Testnet |
| Chain ID | 1337 |
| Block Time | 12 seconds |
| Consensus | Proof of Stake |
| Gas Limit | 30,000,000 |
| Gas Price | 20 Gwei |
| Token Symbol | SDUPI |
| Token Decimals | 18 |

## 🔗 API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/stats` - Network statistics
- `GET /api/blocks` - Latest blocks
- `GET /api/transactions` - Latest transactions
- `GET /api/mempool` - Pending transactions

### Search Endpoints
- `GET /api/search?q=<query>` - Search functionality
- `GET /api/block/:identifier` - Block details
- `GET /api/tx/:hash` - Transaction details
- `GET /api/address/:address` - Address information
- `GET /api/token/:address` - Token information

### Utility Endpoints
- `GET /api/gas-tracker` - Gas price recommendations
- `GET /api/faucet` - Token faucet

## 🛠️ Development

### Project Structure
```
SDUPI/
├── blockchain-explorer-api.js    # Explorer API server
├── deploy-testnet-complete.sh    # Deployment script
├── package.json                  # Dependencies
├── sdupi-blockchain (1)/         # Frontend application
│   ├── app/                      # Next.js pages
│   ├── components/               # React components
│   ├── hooks/                    # Custom hooks
│   └── lib/                      # Utilities
├── configs/                      # Configuration files
├── data/                         # Blockchain data
├── logs/                         # Application logs
└── contracts/                    # Smart contracts
```

### Available Scripts

```bash
# Development
pnpm run dev                    # Start both API and frontend
pnpm run dev:api               # Start only the API server
pnpm run dev:frontend          # Start only the frontend

# Production
pnpm run build                 # Build frontend for production
pnpm start                     # Start production server

# Utilities
pnpm run test                  # Run tests
pnpm run lint                  # Lint code
pnpm run format                # Format code
```

## 🔍 Using the Explorer

### Search Functionality
The explorer supports searching for:
- **Block Numbers**: Enter a number (e.g., "12345")
- **Block Hashes**: Enter a 66-character hex string starting with "0x"
- **Transaction Hashes**: Enter a 66-character hex string starting with "0x"
- **Addresses**: Enter any valid Ethereum address
- **Contract Names**: Search for verified contracts

### Navigation
- **Overview**: Network statistics and latest activity
- **Blocks**: Browse all blocks with detailed information
- **Transactions**: View all transactions with status
- **Mempool**: Monitor pending transactions
- **Analytics**: Network performance and gas tracking

### Real-time Features
- Live block updates
- Real-time transaction monitoring
- WebSocket connections for instant updates
- Network statistics updates every 5 seconds

## 🚰 Token Faucet

Get test SDUPI tokens for development:

- **Endpoint**: http://localhost:3001/api/faucet
- **Daily Limit**: 1,000 SDUPI per address
- **Per Request**: 100 SDUPI
- **Rate Limit**: 10 requests per hour

### Using the Faucet
```bash
curl -X POST http://localhost:3001/api/faucet \
  -H "Content-Type: application/json" \
  -d '{"address": "0xYourAddressHere"}'
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Network Configuration
NETWORK_NAME=SDUPI Testnet
CHAIN_ID=1337
BLOCK_TIME=12

# API Configuration
EXPLORER_PORT=3001
FRONTEND_PORT=3000
RPC_PORT=8545
WS_PORT=8546

# Database
DATABASE_URL=sqlite:./data/sdupi_testnet.db

# Security
JWT_SECRET=your_jwt_secret_here
RATE_LIMIT_MAX_REQUESTS=100

# Blockchain
GAS_LIMIT=30000000
GAS_PRICE=20000000000
MIN_STAKE=1000000000000000000000000
```

### Custom Configuration
- **Block Time**: Modify `BLOCK_TIME` in `.env`
- **Gas Settings**: Adjust `GAS_LIMIT` and `GAS_PRICE`
- **Rate Limiting**: Configure `RATE_LIMIT_MAX_REQUESTS`
- **Ports**: Change port numbers as needed

## 📈 Monitoring

### Built-in Monitoring
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Health Checks**: http://localhost:3001/api/health

### Metrics Available
- Transaction per second (TPS)
- Block time statistics
- Network hashrate
- Gas price trends
- Mempool size
- Active addresses

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find processes using the port
lsof -i :3001
# Kill the process
kill -9 <PID>
```

**2. Dependencies Not Installed**
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**3. Database Issues**
```bash
# Reset database
rm -rf data/
mkdir data
```

**4. WebSocket Connection Issues**
```bash
# Check WebSocket server
curl -I http://localhost:3001
# Check firewall settings
sudo ufw allow 3001
```

### Logs
- **API Logs**: `logs/explorer_api.log`
- **Frontend Logs**: `logs/frontend.log`
- **Deployment Logs**: `logs/testnet_deployment_*.log`

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## 🔒 Security

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable limits in `.env`

### CORS Configuration
- Allowed origins: `http://localhost:3000`, `https://testnet.sdupi.com`
- Configurable in `.env`

### Input Validation
- All API inputs are validated
- SQL injection protection
- XSS protection

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- Use TypeScript for frontend
- Follow ESLint configuration
- Write unit tests
- Document API changes

## 📚 Documentation

### API Documentation
- **OpenAPI Spec**: http://localhost:3001/api/docs
- **Postman Collection**: Available in `/docs/postman/`

### Smart Contract Documentation
- **Contract ABIs**: Available in `/contracts/`
- **Deployment Scripts**: Available in `/scripts/`

## 🆘 Support

### Getting Help
- **Discord**: https://discord.gg/sdupi-testnet
- **GitHub Issues**: https://github.com/sdupi/testnet-issues
- **Documentation**: https://docs.testnet.sdupi.com

### Reporting Bugs
When reporting bugs, please include:
- Operating system and version
- Node.js version
- Error logs
- Steps to reproduce
- Expected vs actual behavior

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js, React, and Node.js
- Inspired by Etherscan and other blockchain explorers
- Community contributions and feedback

---

**🎉 Welcome to the SDUPI Testnet! Start exploring the future of blockchain technology.**

For the latest updates, follow us on:
- [Twitter](https://twitter.com/sdupi_blockchain)
- [Discord](https://discord.gg/sdupi-testnet)
- [GitHub](https://github.com/sdupi/testnet)

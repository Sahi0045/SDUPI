# SDUPI Blockchain Development Guide

## Overview

This document provides comprehensive development guidelines for the SDUPI (Secure Decentralized Unified Payments Interface) blockchain project. The project implements a DAG-based blockchain with ZK-STARKs for privacy and a WASM virtual machine for smart contracts.

## Architecture Overview

### Core Components

1. **DAG Ledger** (`core/src/dag.rs`)
   - Directed Acyclic Graph implementation for transaction storage
   - HashMap-based storage with transaction validation tracking
   - Tip selection and conflict resolution

2. **Consensus Engine** (`core/src/consensus.rs`)
   - Lightweight Proof-of-Stake consensus
   - Fast Probabilistic Consensus (FPC) for conflict resolution
   - Validator stake management

3. **Network Layer** (`core/src/network.rs`)
   - P2P networking using libp2p
   - UDP-based gossip protocol for transaction propagation
   - Node discovery and peer management

4. **Cryptography** (`core/src/crypto.rs`)
   - Ed25519 key pairs for transaction signing
   - SHA-256 hashing for transaction integrity
   - Quantum-resistant cryptography preparation

5. **Storage** (`core/src/storage.rs`)
   - Sled database for persistent storage
   - Transaction and DAG node persistence
   - Validator stake and consensus data storage

6. **ZK-STARKs** (`zk-starks/src/lib.rs`)
   - Zero-knowledge proofs for transaction privacy
   - Circuit-based constraint validation
   - Proof generation and verification

7. **WASM VM** (`wasm-vm/src/lib.rs`)
   - WebAssembly virtual machine for smart contracts
   - DeFi contract execution
   - Gas metering and state management

## Development Setup

### Prerequisites

- Rust 1.70+
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- Zokrates

### Quick Start

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd SDUPI
   ./scripts/setup.sh
   ```

2. **Build the project:**
   ```bash
   cd core
   cargo build --release
   cd ..
   ```

3. **Run tests:**
   ```bash
   ./scripts/test.sh
   ```

4. **Start simulation:**
   ```bash
   ./scripts/simulate.sh
   ```

## Development Workflow

### 1. Core Development

The core module is written in Rust and provides the foundational blockchain functionality:

```rust
// Example: Creating a new transaction
use sdupi_core::{Transaction, KeyPair};

let keypair = KeyPair::generate();
let recipient = KeyPair::generate().public_key();

let transaction = Transaction::new(
    keypair.public_key(),
    recipient,
    1000,  // amount
    10,     // fee
    None,   // parent1
    None,   // parent2
);
```

### 2. DAG Operations

```rust
// Example: Adding transaction to DAG
use sdupi_core::DAGLedger;

let ledger = DAGLedger::new(100);
ledger.add_transaction(transaction)?;

// Get tips for new transaction references
let tips = ledger.get_tips()?;
```

### 3. Consensus Participation

```rust
// Example: Starting consensus round
use sdupi_core::{ConsensusEngine, ConsensusConfig};

let config = ConsensusConfig::default();
let engine = ConsensusEngine::new(dag_ledger, config);

engine.start_round()?;
let validated_count = engine.validate_transactions()?;
```

### 4. Network Communication

```rust
// Example: Broadcasting transaction
use sdupi_core::{NodeNetwork, NetworkConfig};

let config = NetworkConfig::default();
let mut network = NodeNetwork::new(dag_ledger, config).await?;

network.start().await?;
network.broadcast_transaction(&transaction).await?;
```

## Testing Strategy

### Unit Tests

Each module includes comprehensive unit tests:

```bash
# Run all tests
cargo test

# Run specific module tests
cargo test --package sdupi-core --lib dag

# Run with output
cargo test -- --nocapture
```

### Integration Tests

Integration tests verify component interactions:

```bash
# Run integration tests
cargo test --test integration

# Run specific integration test
cargo test --test dag_consensus_integration
```

### Performance Tests

Performance benchmarks ensure target metrics:

```bash
# Run benchmarks
cargo bench

# Run specific benchmark
cargo bench --bench dag_performance
```

### Simulation Tests

Python-based simulations test network behavior:

```bash
# Run simulation
cd simulations
python run_simulation.py --nodes 10 --transactions 1000 --target-tps 1000
```

## Performance Targets

### Phase 1 (Q1-Q2 2026)

- **TPS**: 1,000 transactions per second
- **Latency**: <100ms transaction confirmation
- **Failure Rate**: <0.01%
- **Node Count**: 10 nodes (8 full, 2 light)

### Phase 2 (Q3-Q4 2026)

- **TPS**: 5,000 transactions per second
- **Latency**: <50ms transaction confirmation
- **Node Count**: 50 nodes

### Phase 3 (Q1-Q2 2027)

- **TPS**: 10,000 transactions per second
- **Latency**: <25ms transaction confirmation
- **Node Count**: 100+ nodes

## Security Considerations

### Cryptographic Security

- Ed25519 for transaction signing
- SHA-256 for transaction hashing
- ZK-STARKs for privacy proofs
- Quantum-resistant algorithm preparation

### Network Security

- P2P network with peer validation
- Transaction signature verification
- Consensus mechanism security
- DDoS protection through rate limiting

### Smart Contract Security

- WASM sandboxing
- Gas metering and limits
- State change validation
- Access control mechanisms

## Deployment

### Local Development

```bash
# Start single node
cargo run --bin sdupi-core start --port 8080

# Start with custom config
cargo run --bin sdupi-core start --config config/node.toml
```

### Docker Deployment

```bash
# Build and start network
docker-compose up -d

# Scale nodes
docker-compose up -d --scale sdupi-node=5
```

### Production Deployment

1. **Environment Setup**
   ```bash
   export SDUPI_NODE_ID=1
   export SDUPI_NODE_TYPE=full
   export SDUPI_STAKE_AMOUNT=10000
   ```

2. **Configuration**
   ```toml
   [network]
   listen_addr = "0.0.0.0:8080"
   max_peers = 100
   
   [consensus]
   min_stake = 1000
   round_duration = 10
   ```

3. **Systemd Service**
   ```ini
   [Unit]
   Description=SDUPI Blockchain Node
   After=network.target
   
   [Service]
   Type=simple
   User=sdupi
   ExecStart=/usr/local/bin/sdupi-core start
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

## Monitoring and Observability

### Logging

Structured logging with different levels:

```rust
use tracing::{info, warn, error};

info!("Transaction validated: {}", transaction_id);
warn!("Low stake validator: {}", validator_id);
error!("Consensus failure: {}", error);
```

### Metrics

Key performance indicators:

- Transaction throughput (TPS)
- Latency percentiles (P50, P95, P99)
- Node uptime and health
- Consensus round duration
- Memory and CPU usage

### Health Checks

```bash
# Check node health
curl http://localhost:8080/health

# Get node statistics
curl http://localhost:8080/stats
```

## Troubleshooting

### Common Issues

1. **Node won't start**
   - Check port availability
   - Verify configuration file syntax
   - Check log files for errors

2. **Low TPS performance**
   - Verify consensus configuration
   - Check network connectivity
   - Monitor system resources

3. **Consensus failures**
   - Check validator stakes
   - Verify network topology
   - Review conflict resolution logs

### Debug Mode

Enable debug logging:

```bash
export RUST_LOG=debug
cargo run --bin sdupi-core start
```

### Performance Profiling

```bash
# CPU profiling
cargo install flamegraph
cargo flamegraph --bin sdupi-core

# Memory profiling
cargo install heim
cargo test --features memory-profiling
```

## Contributing

### Code Style

- Follow Rust formatting guidelines (`cargo fmt`)
- Use clippy for linting (`cargo clippy`)
- Write comprehensive tests for new features
- Document public APIs

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and approval
6. Merge to main branch

### Development Standards

- **Code Coverage**: Minimum 80%
- **Performance**: No regression in benchmarks
- **Security**: All security issues must be addressed
- **Documentation**: All public APIs must be documented

## Future Roadmap

### Q3 2026
- Interledger Protocol (ILP) integration
- Advanced DeFi protocols
- Cross-chain interoperability

### Q4 2026
- Layer 2 scaling solutions
- Advanced privacy features
- Enterprise-grade security

### Q1 2027
- 10,000 TPS target
- Advanced consensus mechanisms
- AI-powered optimization

## Support and Resources

### Documentation
- [API Reference](api-reference.md)
- [Architecture Deep Dive](architecture.md)
- [Performance Tuning](performance.md)

### Community
- GitHub Issues for bug reports
- Discord for discussions
- Weekly development calls

### Tools
- [SDUPI Explorer](https://explorer.sdupi.org)
- [SDUPI Faucet](https://faucet.sdupi.org)
- [SDUPI Dashboard](https://dashboard.sdupi.org)

---

For additional support or questions, please contact the development team or refer to the project documentation.

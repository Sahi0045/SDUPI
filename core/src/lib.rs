//! SDUPI Core - DAG-based blockchain implementation
//! 
//! This crate provides the core functionality for the SDUPI blockchain:
//! - DAG ledger with lightweight PoS consensus
//! - Transaction validation and conflict resolution
//! - Node networking and synchronization
//! - Cryptographic primitives and key management

pub mod dag;
pub mod transaction;
pub mod consensus;
pub mod network;
pub mod crypto;
pub mod storage;
pub mod error;
pub mod smart_contract;
pub mod wallet_integrations;

pub use dag::DAGLedger;
pub use transaction::{Transaction, TransactionStatus};
pub use consensus::ConsensusEngine;
pub use network::NodeNetwork;
pub use crypto::KeyPair;
pub use error::SDUPIError;
pub use smart_contract::{SmartContractEngine, SmartContract, ContractExecution, CrossChainBridge};
pub use wallet_integrations::{WalletIntegrationManager, WalletType, WalletConnection, MetaMaskIntegration, PhantomIntegration};

/// Result type for SDUPI operations
pub type Result<T> = std::result::Result<T, SDUPIError>;

/// Re-export common types
pub use uuid::Uuid;
pub use chrono::{DateTime, Utc};

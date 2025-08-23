use thiserror::Error;

/// Custom error types for SDUPI blockchain operations
#[derive(Error, Debug)]
pub enum SDUPIError {
    #[error("Transaction validation failed: {0}")]
    TransactionValidation(String),
    
    #[error("Consensus error: {0}")]
    Consensus(String),
    
    #[error("Network error: {0}")]
    Network(String),
    
    #[error("Storage error: {0}")]
    Storage(String),
    
    #[error("Cryptographic error: {0}")]
    Crypto(String),
    
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    #[error("Invalid DAG structure: {0}")]
    InvalidDAG(String),
    
    #[error("Node not found: {0}")]
    NodeNotFound(String),
    
    #[error("Insufficient stake: {0}")]
    InsufficientStake(String),
    
    #[error("Conflict resolution failed: {0}")]
    ConflictResolution(String),
    
    #[error("ZK-STARK verification failed: {0}")]
    ZKSTARKVerification(String),
    
    #[error("WASM execution error: {0}")]
    WASMExecution(String),
    
    #[error("WASM compilation error: {0}")]
    WasmCompilationError(String),
    
    #[error("Smart contract not found")]
    ContractNotFound,
    
    #[error("Method not found in contract")]
    MethodNotFound,
    
    #[error("Gas limit exceeded")]
    GasLimitExceeded,
    
    #[error("Parallel execution error")]
    ParallelExecutionError,
    
    #[error("Cross-chain bridge not found")]
    BridgeNotFound,
    
    #[error("Invalid bridge state")]
    InvalidBridgeState,
    
    #[error("Wallet not connected")]
    WalletNotConnected,
    
    #[error("Database error: {0}")]
    Database(#[from] sled::Error),
    
    #[error("IO error: {0}")]
    IO(#[from] std::io::Error),
    
    #[error("JSON error: {0}")]
    JSON(#[from] serde_json::Error),
    
    #[error("Bincode error: {0}")]
    Bincode(#[from] bincode::Error),
}

impl From<&str> for SDUPIError {
    fn from(err: &str) -> Self {
        SDUPIError::TransactionValidation(err.to_string())
    }
}

impl From<String> for SDUPIError {
    fn from(err: String) -> Self {
        SDUPIError::TransactionValidation(err)
    }
}

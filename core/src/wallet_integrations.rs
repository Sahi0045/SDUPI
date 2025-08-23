use crate::error::SDUPIError;
use crate::crypto::{ed25519_sign, ed25519_verify, sha256_hash};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;
use std::sync::Arc;

/// Wallet Integration System for SDUPI Blockchain
/// Supports: MetaMask, Phantom, WalletConnect, and native SDUPI wallet

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WalletType {
    MetaMask,
    Phantom,
    WalletConnect,
    SDUPINative,
    TrustWallet,
    CoinbaseWallet,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WalletConnection {
    pub wallet_type: WalletType,
    pub address: String,
    pub public_key: Vec<u8>,
    pub chain_id: u64,
    pub connected_at: u64,
    pub last_activity: u64,
    pub balance: u64,
    pub nonce: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WalletTransaction {
    pub from: String,
    pub to: String,
    pub amount: u64,
    pub gas_limit: u64,
    pub gas_price: u64,
    pub nonce: u64,
    pub data: Vec<u8>,
    pub signature: Vec<u8>,
    pub wallet_type: WalletType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WalletSignature {
    pub message: Vec<u8>,
    pub signature: Vec<u8>,
    pub public_key: Vec<u8>,
    pub wallet_type: WalletType,
}

pub struct WalletIntegrationManager {
    connections: Arc<RwLock<HashMap<String, WalletConnection>>>,
    supported_wallets: Vec<WalletType>,
    chain_id: u64,
    rpc_url: String,
}

impl WalletIntegrationManager {
    pub fn new(chain_id: u64, rpc_url: String) -> Self {
        let supported_wallets = vec![
            WalletType::MetaMask,
            WalletType::Phantom,
            WalletType::WalletConnect,
            WalletType::SDUPINative,
            WalletType::TrustWallet,
            WalletType::CoinbaseWallet,
        ];
        
        WalletIntegrationManager {
            connections: Arc::new(RwLock::new(HashMap::new())),
            supported_wallets,
            chain_id,
            rpc_url,
        }
    }
    
    /// Connect MetaMask wallet
    pub async fn connect_metamask(&self, address: String, public_key: Vec<u8>) -> Result<WalletConnection, SDUPIError> {
        let connection = WalletConnection {
            wallet_type: WalletType::MetaMask,
            address: address.clone(),
            public_key,
            chain_id: self.chain_id,
            connected_at: chrono::Utc::now().timestamp() as u64,
            last_activity: chrono::Utc::now().timestamp() as u64,
            balance: 0,
            nonce: 0,
        };
        
        self.connections.write().await.insert(address.clone(), connection.clone());
        
        println!("🔗 MetaMask connected: {}", address);
        println!("   Chain ID: {}", self.chain_id);
        println!("   RPC URL: {}", self.rpc_url);
        
        Ok(connection)
    }
    
    /// Connect Phantom wallet
    pub async fn connect_phantom(&self, address: String, public_key: Vec<u8>) -> Result<WalletConnection, SDUPIError> {
        let connection = WalletConnection {
            wallet_type: WalletType::Phantom,
            address: address.clone(),
            public_key,
            chain_id: self.chain_id,
            connected_at: chrono::Utc::now().timestamp() as u64,
            last_activity: chrono::Utc::now().timestamp() as u64,
            balance: 0,
            nonce: 0,
        };
        
        self.connections.write().await.insert(address.clone(), connection.clone());
        
        println!("👻 Phantom connected: {}", address);
        println!("   Chain ID: {}", self.chain_id);
        println!("   RPC URL: {}", self.rpc_url);
        
        Ok(connection)
    }
    
    /// Connect WalletConnect
    pub async fn connect_walletconnect(&self, address: String, public_key: Vec<u8>) -> Result<WalletConnection, SDUPIError> {
        let connection = WalletConnection {
            wallet_type: WalletType::WalletConnect,
            address: address.clone(),
            public_key,
            chain_id: self.chain_id,
            connected_at: chrono::Utc::now().timestamp() as u64,
            last_activity: chrono::Utc::now().timestamp() as u64,
            balance: 0,
            nonce: 0,
        };
        
        self.connections.write().await.insert(address.clone(), connection.clone());
        
        println!("🔌 WalletConnect connected: {}", address);
        println!("   Chain ID: {}", self.chain_id);
        println!("   RPC URL: {}", self.rpc_url);
        
        Ok(connection)
    }
    
    /// Connect native SDUPI wallet
    pub async fn connect_sdupi_native(&self, address: String, public_key: Vec<u8>) -> Result<WalletConnection, SDUPIError> {
        let connection = WalletConnection {
            wallet_type: WalletType::SDUPINative,
            address: address.clone(),
            public_key,
            chain_id: self.chain_id,
            connected_at: chrono::Utc::now().timestamp() as u64,
            last_activity: chrono::Utc::now().timestamp() as u64,
            balance: 0,
            nonce: 0,
        };
        
        self.connections.write().await.insert(address.clone(), connection.clone());
        
        println!("⚡ SDUPI Native wallet connected: {}", address);
        println!("   Chain ID: {}", self.chain_id);
        println!("   RPC URL: {}", self.rpc_url);
        
        Ok(connection)
    }
    
    /// Sign transaction with connected wallet
    pub async fn sign_transaction(
        &self,
        address: &str,
        transaction: &WalletTransaction,
    ) -> Result<WalletSignature, SDUPIError> {
        let connections = self.connections.read().await;
        let connection = connections.get(address)
            .ok_or(SDUPIError::WalletNotConnected)?;
        
        // Create message to sign
        let message = self.create_transaction_message(transaction)?;
        
        // Sign with wallet's private key (in real implementation, this would be done by the wallet)
        let signature = ed25519_sign(&message, &connection.public_key)?;
        
        let wallet_signature = WalletSignature {
            message,
            signature,
            public_key: connection.public_key.clone(),
            wallet_type: connection.wallet_type.clone(),
        };
        
        println!("✍️ Transaction signed by {}: {}", address, transaction.amount);
        println!("   Wallet: {:?}", connection.wallet_type);
        println!("   Signature: {} bytes", signature.len());
        
        Ok(wallet_signature)
    }
    
    /// Verify transaction signature
    pub async fn verify_signature(
        &self,
        signature: &WalletSignature,
    ) -> Result<bool, SDUPIError> {
        let is_valid = ed25519_verify(&signature.message, &signature.signature, &signature.public_key)?;
        
        if is_valid {
            println!("✅ Signature verified successfully");
            println!("   Wallet: {:?}", signature.wallet_type);
        } else {
            println!("❌ Signature verification failed");
        }
        
        Ok(is_valid)
    }
    
    /// Get wallet balance
    pub async fn get_balance(&self, address: &str) -> Result<u64, SDUPIError> {
        let connections = self.connections.read().await;
        let connection = connections.get(address)
            .ok_or(SDUPIError::WalletNotConnected)?;
        
        // In real implementation, this would query the blockchain
        Ok(connection.balance)
    }
    
    /// Update wallet balance
    pub async fn update_balance(&self, address: &str, new_balance: u64) -> Result<(), SDUPIError> {
        let mut connections = self.connections.write().await;
        if let Some(connection) = connections.get_mut(address) {
            connection.balance = new_balance;
            connection.last_activity = chrono::Utc::now().timestamp() as u64;
        }
        
        Ok(())
    }
    
    /// Disconnect wallet
    pub async fn disconnect_wallet(&self, address: &str) -> Result<(), SDUPIError> {
        let mut connections = self.connections.write().await;
        if connections.remove(address).is_some() {
            println!("🔌 Wallet disconnected: {}", address);
        }
        
        Ok(())
    }
    
    /// Get all connected wallets
    pub async fn get_connected_wallets(&self) -> Vec<WalletConnection> {
        let connections = self.connections.read().await;
        connections.values().cloned().collect()
    }
    
    /// Check if wallet is supported
    pub fn is_wallet_supported(&self, wallet_type: &WalletType) -> bool {
        self.supported_wallets.contains(wallet_type)
    }
    
    /// Create transaction message for signing
    fn create_transaction_message(&self, transaction: &WalletTransaction) -> Result<Vec<u8>, SDUPIError> {
        let message = format!(
            "{}:{}:{}:{}:{}:{}",
            transaction.from,
            transaction.to,
            transaction.amount,
            transaction.gas_limit,
            transaction.gas_price,
            transaction.nonce,
        );
        
        Ok(message.as_bytes().to_vec())
    }
}

/// MetaMask specific integration
pub struct MetaMaskIntegration {
    chain_config: MetaMaskChainConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaMaskChainConfig {
    pub chain_id: String,
    pub chain_name: String,
    pub native_currency: NativeCurrency,
    pub rpc_urls: Vec<String>,
    pub block_explorer_urls: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NativeCurrency {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
}

impl MetaMaskIntegration {
    pub fn new() -> Self {
        let chain_config = MetaMaskChainConfig {
            chain_id: "0x1".to_string(), // SDUPI mainnet
            chain_name: "SDUPI Blockchain".to_string(),
            native_currency: NativeCurrency {
                name: "SDUPI Token".to_string(),
                symbol: "SDUPI".to_string(),
                decimals: 18,
            },
            rpc_urls: vec!["https://rpc.sdupi.com".to_string()],
            block_explorer_urls: vec!["https://explorer.sdupi.com".to_string()],
        };
        
        MetaMaskIntegration { chain_config }
    }
    
    /// Add SDUPI network to MetaMask
    pub async fn add_network_to_metamask(&self) -> Result<(), SDUPIError> {
        println!("🌐 Adding SDUPI network to MetaMask:");
        println!("   Chain ID: {}", self.chain_config.chain_id);
        println!("   Chain Name: {}", self.chain_config.chain_name);
        println!("   Symbol: {}", self.chain_config.native_currency.symbol);
        println!("   RPC URL: {}", self.chain_config.rpc_urls[0]);
        println!("   Explorer: {}", self.chain_config.block_explorer_urls[0]);
        
        Ok(())
    }
    
    /// Request account access
    pub async fn request_accounts(&self) -> Result<Vec<String>, SDUPIError> {
        println!("🔐 Requesting MetaMask account access...");
        // In real implementation, this would trigger MetaMask popup
        Ok(vec!["0x1234567890abcdef".to_string()])
    }
    
    /// Switch to SDUPI network
    pub async fn switch_network(&self) -> Result<(), SDUPIError> {
        println!("🔄 Switching MetaMask to SDUPI network...");
        Ok(())
    }
}

/// Phantom wallet specific integration
pub struct PhantomIntegration {
    connection_url: String,
}

impl PhantomIntegration {
    pub fn new() -> Self {
        PhantomIntegration {
            connection_url: "https://phantom.app".to_string(),
        }
    }
    
    /// Connect to Phantom wallet
    pub async fn connect(&self) -> Result<String, SDUPIError> {
        println!("👻 Connecting to Phantom wallet...");
        println!("   URL: {}", self.connection_url);
        Ok("phantom_connection_id".to_string())
    }
    
    /// Sign message with Phantom
    pub async fn sign_message(&self, message: &[u8]) -> Result<Vec<u8>, SDUPIError> {
        println!("✍️ Signing message with Phantom wallet...");
        println!("   Message length: {} bytes", message.len());
        Ok(sha256_hash(message))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_metamask_connection() {
        let manager = WalletIntegrationManager::new(1, "https://rpc.sdupi.com".to_string());
        let address = "0x1234567890abcdef".to_string();
        let public_key = vec![1, 2, 3, 4, 5];
        
        let connection = manager.connect_metamask(address.clone(), public_key).await.unwrap();
        assert_eq!(connection.address, address);
        assert!(matches!(connection.wallet_type, WalletType::MetaMask));
    }
    
    #[tokio::test]
    async fn test_phantom_connection() {
        let manager = WalletIntegrationManager::new(1, "https://rpc.sdupi.com".to_string());
        let address = "phantom_address_123".to_string();
        let public_key = vec![1, 2, 3, 4, 5];
        
        let connection = manager.connect_phantom(address.clone(), public_key).await.unwrap();
        assert_eq!(connection.address, address);
        assert!(matches!(connection.wallet_type, WalletType::Phantom));
    }
    
    #[tokio::test]
    async fn test_transaction_signing() {
        let manager = WalletIntegrationManager::new(1, "https://rpc.sdupi.com".to_string());
        let address = "0x1234567890abcdef".to_string();
        let public_key = vec![1, 2, 3, 4, 5];
        
        // Connect wallet
        manager.connect_metamask(address.clone(), public_key).await.unwrap();
        
        // Create transaction
        let transaction = WalletTransaction {
            from: address.clone(),
            to: "0xabcdef1234567890".to_string(),
            amount: 1000,
            gas_limit: 21000,
            gas_price: 20,
            nonce: 0,
            data: vec![],
            signature: vec![],
            wallet_type: WalletType::MetaMask,
        };
        
        // Sign transaction
        let signature = manager.sign_transaction(&address, &transaction).await.unwrap();
        assert!(!signature.signature.is_empty());
    }
}

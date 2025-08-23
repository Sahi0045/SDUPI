use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use crate::crypto::PublicKey;

/// Transaction status in the DAG
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TransactionStatus {
    Pending,
    Validated,
    Confirmed,
    Rejected,
}

/// Transaction structure for SDUPI DAG
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    /// Unique transaction identifier
    pub id: Uuid,
    
    /// Transaction timestamp
    pub timestamp: DateTime<Utc>,
    
    /// Sender's public key
    pub sender: PublicKey,
    
    /// Recipient's public key
    pub recipient: PublicKey,
    
    /// Transaction amount (in smallest unit)
    pub amount: u64,
    
    /// Transaction fee
    pub fee: u64,
    
    /// Parent transaction references (DAG structure)
    pub parent1: Option<Uuid>,
    pub parent2: Option<Uuid>,
    
    /// Transaction status
    pub status: TransactionStatus,
    
    /// ZK-STARK proof for privacy
    pub zk_proof: Option<Vec<u8>>,
    
    /// Transaction signature
    pub signature: Option<Vec<u8>>,
    
    /// Additional metadata
    pub metadata: serde_json::Value,
}

impl Transaction {
    /// Create a new transaction
    pub fn new(
        sender: PublicKey,
        recipient: PublicKey,
        amount: u64,
        fee: u64,
        parent1: Option<Uuid>,
        parent2: Option<Uuid>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            sender,
            recipient,
            amount,
            fee,
            parent1,
            parent2,
            status: TransactionStatus::Pending,
            zk_proof: None,
            signature: None,
            metadata: serde_json::Value::Null,
        }
    }
    
    /// Calculate transaction hash
    pub fn hash(&self) -> Vec<u8> {
        let mut hasher = Sha256::new();
        
        // Hash all fields except signature and zk_proof
        let data = serde_json::json!({
            "id": self.id.to_string(),
            "timestamp": self.timestamp.to_rfc3339(),
            "sender": self.sender.to_string(),
            "recipient": self.recipient.to_string(),
            "amount": self.amount,
            "fee": self.fee,
            "parent1": self.parent1.map(|p| p.to_string()),
            "parent2": self.parent2.map(|p| p.to_string()),
            "metadata": self.metadata
        });
        
        hasher.update(data.to_string().as_bytes());
        hasher.finalize().to_vec()
    }
    
    /// Validate transaction structure
    pub fn validate_structure(&self) -> Result<(), crate::SDUPIError> {
        if self.amount == 0 {
            return Err("Transaction amount cannot be zero".into());
        }
        
        if self.fee == 0 {
            return Err("Transaction fee cannot be zero".into());
        }
        
        if self.sender == self.recipient {
            return Err("Sender and recipient cannot be the same".into());
        }
        
        Ok(())
    }
    
    /// Check if transaction is ready for validation
    pub fn is_ready_for_validation(&self) -> bool {
        self.status == TransactionStatus::Pending
            && self.signature.is_some()
            && self.zk_proof.is_some()
    }
    
    /// Mark transaction as validated
    pub fn mark_validated(&mut self) {
        self.status = TransactionStatus::Validated;
    }
    
    /// Mark transaction as confirmed
    pub fn mark_confirmed(&mut self) {
        self.status = TransactionStatus::Confirmed;
    }
    
    /// Mark transaction as rejected
    pub fn mark_rejected(&mut self) {
        self.status = TransactionStatus::Rejected;
    }
}

impl PartialEq for Transaction {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

impl Eq for Transaction {}

impl std::hash::Hash for Transaction {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.id.hash(state);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::KeyPair;
    
    #[test]
    fn test_transaction_creation() {
        let keypair = KeyPair::generate();
        let recipient = KeyPair::generate().public_key();
        
        let tx = Transaction::new(
            keypair.public_key(),
            recipient,
            1000,
            10,
            None,
            None,
        );
        
        assert_eq!(tx.amount, 1000);
        assert_eq!(tx.fee, 10);
        assert_eq!(tx.status, TransactionStatus::Pending);
        assert!(tx.parent1.is_none());
        assert!(tx.parent2.is_none());
    }
    
    #[test]
    fn test_transaction_validation() {
        let keypair = KeyPair::generate();
        let recipient = KeyPair::generate().public_key();
        
        let tx = Transaction::new(
            keypair.public_key(),
            recipient,
            1000,
            10,
            None,
            None,
        );
        
        assert!(tx.validate_structure().is_ok());
    }
    
    #[test]
    fn test_transaction_hash_consistency() {
        let keypair = KeyPair::generate();
        let recipient = KeyPair::generate().public_key();
        
        let tx1 = Transaction::new(
            keypair.public_key(),
            recipient.clone(),
            1000,
            10,
            None,
            None,
        );
        
        let tx2 = Transaction::new(
            keypair.public_key(),
            recipient,
            1000,
            10,
            None,
            None,
        );
        
        // Different UUIDs should produce different hashes
        assert_ne!(tx1.hash(), tx2.hash());
    }
}

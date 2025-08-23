use std::collections::HashMap;
use std::path::Path;
use sled::{Db, Tree};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use crate::transaction::{Transaction, TransactionStatus};
use crate::dag::DAGNode;
use crate::SDUPIError;

/// Storage manager for SDUPI blockchain
pub struct StorageManager {
    /// Main database instance
    db: Db,
    
    /// Transaction storage tree
    transactions: Tree,
    
    /// DAG nodes storage tree
    dag_nodes: Tree,
    
    /// Validator stakes storage tree
    validator_stakes: Tree,
    
    /// Consensus rounds storage tree
    consensus_rounds: Tree,
    
    /// Network peers storage tree
    network_peers: Tree,
}

impl StorageManager {
    /// Create a new storage manager
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self, SDUPIError> {
        let db = sled::open(path)
            .map_err(|e| SDUPIError::Database(e))?;
        
        let transactions = db.open_tree("transactions")
            .map_err(|e| SDUPIError::Database(e))?;
        
        let dag_nodes = db.open_tree("dag_nodes")
            .map_err(|e| SDUPIError::Database(e))?;
        
        let validator_stakes = db.open_tree("validator_stakes")
            .map_err(|e| SDUPIError::Database(e))?;
        
        let consensus_rounds = db.open_tree("consensus_rounds")
            .map_err(|e| SDUPIError::Database(e))?;
        
        let network_peers = db.open_tree("network_peers")
            .map_err(|e| SDUPIError::Database(e))?;
        
        Ok(Self {
            db,
            transactions,
            dag_nodes,
            validator_stakes,
            consensus_rounds,
            network_peers,
        })
    }
    
    /// Store a transaction
    pub fn store_transaction(&self, transaction: &Transaction) -> Result<(), SDUPIError> {
        let key = transaction.id.to_string();
        let value = bincode::serialize(transaction)
            .map_err(|e| SDUPIError::Serialization(format!("Failed to serialize transaction: {}", e)))?;
        
        self.transactions.insert(key, value)
            .map_err(|e| SDUPIError::Database(e))?;
        
        Ok(())
    }
    
    /// Retrieve a transaction by ID
    pub fn get_transaction(&self, id: &Uuid) -> Result<Option<Transaction>, SDUPIError> {
        let key = id.to_string();
        
        if let Some(value) = self.transactions.get(key)
            .map_err(|e| SDUPIError::Database(e))? {
            let transaction = bincode::deserialize(&value)
                .map_err(|e| SDUPIError::Serialization(format!("Failed to deserialize transaction: {}", e)))?;
            Ok(Some(transaction))
        } else {
            Ok(None)
        }
    }
    
    /// Store a DAG node
    pub fn store_dag_node(&self, node: &DAGNode) -> Result<(), SDUPIError> {
        let key = node.transaction.id.to_string();
        let value = bincode::serialize(node)
            .map_err(|e| SDUPIError::Serialization(format!("Failed to serialize DAG node: {}", e)))?;
        
        self.dag_nodes.insert(key, value)
            .map_err(|e| SDUPIError::Database(e))?;
        
        Ok(())
    }
    
    /// Retrieve a DAG node by ID
    pub fn get_dag_node(&self, id: &Uuid) -> Result<Option<DAGNode>, SDUPIError> {
        let key = id.to_string();
        
        if let Some(value) = self.dag_nodes.get(key)
            .map_err(|e| SDUPIError::Database(e))? {
            let node = bincode::deserialize(&value)
                .map_err(|e| SDUPIError::Serialization(format!("Failed to deserialize DAG node: {}", e)))?;
            Ok(Some(node))
        } else {
            Ok(None)
        }
    }
    
    /// Store validator stake information
    pub fn store_validator_stake(&self, public_key: &str, stake: &ValidatorStakeData) -> Result<(), SDUPIError> {
        let value = bincode::serialize(stake)
            .map_err(|e| SDUPIError::Serialization(format!("Failed to serialize validator stake: {}", e)))?;
        
        self.validator_stakes.insert(public_key, value)
            .map_err(|e| SDUPIError::Database(e))?;
        
        Ok(())
    }
    
    /// Retrieve validator stake information
    pub fn get_validator_stake(&self, public_key: &str) -> Result<Option<ValidatorStakeData>, SDUPIError> {
        if let Some(value) = self.validator_stakes.get(public_key)
            .map_err(|e| SDUPIError::Database(e))? {
            let stake = bincode::deserialize(&value)
                .map_err(|e| SDUPIError::Serialization(format!("Failed to deserialize validator stake: {}", e)))?;
            Ok(Some(stake))
        } else {
            Ok(None)
        }
    }
    
    /// Store consensus round data
    pub fn store_consensus_round(&self, round_number: u64, round_data: &ConsensusRoundData) -> Result<(), SDUPIError> {
        let key = round_number.to_string();
        let value = bincode::serialize(round_data)
            .map_err(|e| SDUPIError::Serialization(format!("Failed to serialize consensus round: {}", e)))?;
        
        self.consensus_rounds.insert(key, value)
            .map_err(|e| SDUPIError::Database(e))?;
        
        Ok(())
    }
    
    /// Retrieve consensus round data
    pub fn get_consensus_round(&self, round_number: u64) -> Result<Option<ConsensusRoundData>, SDUPIError> {
        let key = round_number.to_string();
        
        if let Some(value) = self.consensus_rounds.get(key)
            .map_err(|e| SDUPIError::Database(e))? {
            let round_data = bincode::deserialize(&value)
                .map_err(|e| SDUPIError::Serialization(format!("Failed to deserialize consensus round: {}", e)))?;
            Ok(Some(round_data))
        } else {
            Ok(None)
        }
    }
    
    /// Store network peer information
    pub fn store_network_peer(&self, peer_id: &str, peer_info: &NetworkPeerData) -> Result<(), SDUPIError> {
        let value = bincode::serialize(peer_info)
            .map_err(|e| SDUPIError::Serialization(format!("Failed to serialize network peer: {}", e)))?;
        
        self.network_peers.insert(peer_id, value)
            .map_err(|e| SDUPIError::Database(e))?;
        
        Ok(())
    }
    
    /// Retrieve network peer information
    pub fn get_network_peer(&self, peer_id: &str) -> Result<Option<NetworkPeerData>, SDUPIError> {
        if let Some(value) = self.network_peers.get(peer_id)
            .map_err(|e| SDUPIError::Database(e))? {
            let peer_info = bincode::deserialize(&value)
                .map_err(|e| SDUPIError::Serialization(format!("Failed to deserialize network peer: {}", e)))?;
            Ok(Some(peer_info))
        } else {
            Ok(None)
        }
    }
    
    /// Get all transactions
    pub fn get_all_transactions(&self) -> Result<Vec<Transaction>, SDUPIError> {
        let mut transactions = Vec::new();
        
        for result in self.transactions.iter() {
            let (_, value) = result.map_err(|e| SDUPIError::Database(e))?;
            let transaction = bincode::deserialize(&value)
                .map_err(|e| SDUPIError::Serialization(format!("Failed to deserialize transaction: {}", e)))?;
            transactions.push(transaction);
        }
        
        Ok(transactions)
    }
    
    /// Get transactions by status
    pub fn get_transactions_by_status(&self, status: TransactionStatus) -> Result<Vec<Transaction>, SDUPIError> {
        let all_transactions = self.get_all_transactions()?;
        Ok(all_transactions.into_iter()
            .filter(|tx| tx.status == status)
            .collect())
    }
    
    /// Get transaction count by status
    pub fn get_transaction_count_by_status(&self, status: TransactionStatus) -> Result<usize, SDUPIError> {
        let count = self.get_transactions_by_status(status)?.len();
        Ok(count)
    }
    
    /// Get all validator stakes
    pub fn get_all_validator_stakes(&self) -> Result<HashMap<String, ValidatorStakeData>, SDUPIError> {
        let mut stakes = HashMap::new();
        
        for result in self.validator_stakes.iter() {
            let (key, value) = result.map_err(|e| SDUPIError::Database(e))?;
            let stake = bincode::deserialize(&value)
                .map_err(|e| SDUPIError::Serialization(format!("Failed to deserialize validator stake: {}", e)))?;
            
            if let Ok(key_str) = String::from_utf8(key.to_vec()) {
                stakes.insert(key_str, stake);
            }
        }
        
        Ok(stakes)
    }
    
    /// Delete a transaction
    pub fn delete_transaction(&self, id: &Uuid) -> Result<(), SDUPIError> {
        let key = id.to_string();
        self.transactions.remove(key)
            .map_err(|e| SDUPIError::Database(e))?;
        Ok(())
    }
    
    /// Delete a DAG node
    pub fn delete_dag_node(&self, id: &Uuid) -> Result<(), SDUPIError> {
        let key = id.to_string();
        self.dag_nodes.remove(key)
            .map_err(|e| SDUPIError::Database(e))?;
        Ok(())
    }
    
    /// Flush all data to disk
    pub fn flush(&self) -> Result<(), SDUPIError> {
        self.db.flush()
            .map_err(|e| SDUPIError::Database(e))?;
        Ok(())
    }
    
    /// Get database statistics
    pub fn get_statistics(&self) -> Result<StorageStats, SDUPIError> {
        let transaction_count = self.transactions.len();
        let dag_node_count = self.dag_nodes.len();
        let validator_stake_count = self.validator_stakes.len();
        let consensus_round_count = self.consensus_rounds.len();
        let network_peer_count = self.network_peers.len();
        
        Ok(StorageStats {
            transaction_count,
            dag_node_count,
            validator_stake_count,
            consensus_round_count,
            network_peer_count,
        })
    }
}

/// Validator stake data for storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorStakeData {
    pub public_key: String,
    pub stake_amount: u64,
    pub last_validation: Option<u64>,
    pub validation_count: u64,
}

/// Consensus round data for storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusRoundData {
    pub round_number: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub validators: Vec<String>,
    pub validated_transactions: Vec<Uuid>,
    pub conflicts: Vec<ConflictData>,
}

/// Conflict data for storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConflictData {
    pub transaction_ids: Vec<Uuid>,
    pub conflict_type: String,
    pub detected_at: u64,
    pub resolved: bool,
}

/// Network peer data for storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkPeerData {
    pub peer_id: String,
    pub address: String,
    pub last_seen: u64,
    pub is_connected: bool,
    pub node_type: String,
}

/// Storage statistics
#[derive(Debug, Clone)]
pub struct StorageStats {
    pub transaction_count: usize,
    pub dag_node_count: usize,
    pub validator_stake_count: usize,
    pub consensus_round_count: usize,
    pub network_peer_count: usize,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::KeyPair;
    use crate::transaction::Transaction;
    use tempfile::tempdir;
    
    #[test]
    fn test_storage_manager_creation() {
        let temp_dir = tempdir().unwrap();
        let storage = StorageManager::new(temp_dir.path()).unwrap();
        
        let stats = storage.get_statistics().unwrap();
        assert_eq!(stats.transaction_count, 0);
        assert_eq!(stats.dag_node_count, 0);
    }
    
    #[test]
    fn test_transaction_storage() {
        let temp_dir = tempdir().unwrap();
        let storage = StorageManager::new(temp_dir.path()).unwrap();
        
        let keypair = KeyPair::generate();
        let recipient = KeyPair::generate().public_key();
        
        let transaction = Transaction::new(
            keypair.public_key(),
            recipient,
            1000,
            10,
            None,
            None,
        );
        
        // Store transaction
        storage.store_transaction(&transaction).unwrap();
        
        // Retrieve transaction
        let retrieved = storage.get_transaction(&transaction.id).unwrap().unwrap();
        assert_eq!(retrieved.id, transaction.id);
        assert_eq!(retrieved.amount, 1000);
        
        // Check statistics
        let stats = storage.get_statistics().unwrap();
        assert_eq!(stats.transaction_count, 1);
    }
    
    #[test]
    fn test_validator_stake_storage() {
        let temp_dir = tempdir().unwrap();
        let storage = StorageManager::new(temp_dir.path()).unwrap();
        
        let stake_data = ValidatorStakeData {
            public_key: "test_key".to_string(),
            stake_amount: 1000,
            last_validation: Some(1234567890),
            validation_count: 5,
        };
        
        // Store stake data
        storage.store_validator_stake("test_key", &stake_data).unwrap();
        
        // Retrieve stake data
        let retrieved = storage.get_validator_stake("test_key").unwrap().unwrap();
        assert_eq!(retrieved.public_key, "test_key");
        assert_eq!(retrieved.stake_amount, 1000);
        
        // Check statistics
        let stats = storage.get_statistics().unwrap();
        assert_eq!(stats.validator_stake_count, 1);
    }
}

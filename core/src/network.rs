use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};
use tokio::sync::mpsc;
use libp2p::{
    core::upgrade,
    floodsub::{Floodsub, FloodsubEvent, FloodsubMessage, Topic},
    identity,
    mdns::{Mdns, MdnsEvent},
    swarm::{NetworkBehaviourEventProcess, Swarm},
    tcp::TokioTcpConfig,
    Transport, PeerId,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::transaction::Transaction;
use crate::dag::DAGLedger;
use crate::SDUPIError;

/// Network message types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NetworkMessage {
    /// New transaction broadcast
    NewTransaction {
        transaction: Transaction,
        timestamp: u64,
    },
    
    /// Transaction validation request
    ValidationRequest {
        transaction_id: Uuid,
        validator: String,
        timestamp: u64,
    },
    
    /// Transaction validation response
    ValidationResponse {
        transaction_id: Uuid,
        validator: String,
        is_valid: bool,
        timestamp: u64,
    },
    
    /// DAG sync request
    DAGSyncRequest {
        from_transaction: Option<Uuid>,
        limit: usize,
        timestamp: u64,
    },
    
    /// DAG sync response
    DAGSyncResponse {
        transactions: Vec<Transaction>,
        has_more: bool,
        timestamp: u64,
    },
    
    /// Heartbeat message
    Heartbeat {
        node_id: String,
        timestamp: u64,
        uptime: u64,
    },
    
    /// Peer discovery request
    PeerDiscovery {
        node_id: String,
        peers: Vec<String>,
        timestamp: u64,
    },
}

/// Network behavior for SDUPI nodes
#[derive(NetworkBehaviour)]
pub struct SDUPINetworkBehaviour {
    /// Floodsub for message broadcasting
    floodsub: Floodsub,
    
    /// mDNS for local peer discovery
    mdns: Mdns,
}

impl NetworkBehaviourEventProcess<FloodsubEvent> for SDUPINetworkBehaviour {
    fn inject_event(&mut self, event: FloodsubEvent) {
        if let FloodsubEvent::Message(message) = event {
            // Handle incoming floodsub messages
            self.handle_floodsub_message(message);
        }
    }
}

impl NetworkBehaviourEventProcess<MdnsEvent> for SDUPINetworkBehaviour {
    fn inject_event(&mut self, event: MdnsEvent) {
        match event {
            MdnsEvent::Discovered(list) => {
                for (peer_id, _) in list {
                    self.floodsub.add_node_to_partial_view(peer_id);
                }
            }
            MdnsEvent::Expired(list) => {
                for (peer_id, _) in list {
                    if !self.mdns.has_node(&peer_id) {
                        self.floodsub.remove_node_from_partial_view(&peer_id);
                    }
                }
            }
        }
    }
}

impl SDUPINetworkBehaviour {
    /// Create new network behavior
    pub fn new(peer_id: PeerId) -> Self {
        let mut behaviour = Self {
            floodsub: Floodsub::new(peer_id),
            mdns: Mdns::new(Default::default()).expect("Failed to create mDNS"),
        };
        
        // Subscribe to network topics
        behaviour.floodsub.subscribe(Topic::new("transactions"));
        behaviour.floodsub.subscribe(Topic::new("validation"));
        behaviour.floodsub.subscribe(Topic::new("sync"));
        behaviour.floodsub.subscribe(Topic::new("heartbeat"));
        
        behaviour
    }
    
    /// Handle incoming floodsub messages
    fn handle_floodsub_message(&mut self, message: FloodsubMessage) {
        // Parse and handle network messages
        if let Ok(network_message) = serde_json::from_slice::<NetworkMessage>(&message.data) {
            match network_message {
                NetworkMessage::NewTransaction { transaction, .. } => {
                    // Handle new transaction
                    tracing::info!("Received new transaction: {}", transaction.id);
                }
                NetworkMessage::ValidationRequest { transaction_id, .. } => {
                    // Handle validation request
                    tracing::info!("Received validation request for: {}", transaction_id);
                }
                NetworkMessage::Heartbeat { node_id, .. } => {
                    // Handle heartbeat
                    tracing::debug!("Received heartbeat from: {}", node_id);
                }
                _ => {
                    // Handle other message types
                    tracing::debug!("Received network message: {:?}", network_message);
                }
            }
        }
    }
    
    /// Broadcast a message to the network
    pub fn broadcast(&mut self, topic: &str, message: &NetworkMessage) -> Result<(), SDUPIError> {
        let topic = Topic::new(topic);
        let data = serde_json::to_vec(message)
            .map_err(|e| SDUPIError::Serialization(format!("Failed to serialize message: {}", e)))?;
        
        self.floodsub.publish(topic, data);
        Ok(())
    }
}

/// Network node for SDUPI blockchain
pub struct NodeNetwork {
    /// Local peer ID
    peer_id: PeerId,
    
    /// Network swarm
    swarm: Swarm<SDUPINetworkBehaviour>,
    
    /// DAG ledger reference
    dag_ledger: Arc<DAGLedger>,
    
    /// Connected peers
    peers: Arc<RwLock<HashMap<PeerId, PeerInfo>>>,
    
    /// Message sender for async processing
    message_sender: mpsc::UnboundedSender<NetworkMessage>,
    
    /// Network configuration
    config: NetworkConfig,
}

/// Peer information
#[derive(Debug, Clone)]
pub struct PeerInfo {
    /// Peer ID
    pub peer_id: PeerId,
    
    /// Node address
    pub address: String,
    
    /// Last seen timestamp
    pub last_seen: Instant,
    
    /// Connection status
    pub is_connected: bool,
    
    /// Node type (full/light)
    pub node_type: NodeType,
}

/// Node types
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum NodeType {
    Full,
    Light,
}

/// Network configuration
#[derive(Debug, Clone)]
pub struct NetworkConfig {
    /// Listen address
    pub listen_addr: String,
    
    /// Bootstrap peers
    pub bootstrap_peers: Vec<String>,
    
    /// Heartbeat interval
    pub heartbeat_interval: Duration,
    
    /// Connection timeout
    pub connection_timeout: Duration,
    
    /// Max peers
    pub max_peers: usize,
}

impl Default for NetworkConfig {
    fn default() -> Self {
        Self {
            listen_addr: "/ip4/0.0.0.0/tcp/0".to_string(),
            bootstrap_peers: Vec::new(),
            heartbeat_interval: Duration::from_secs(30),
            connection_timeout: Duration::from_secs(10),
            max_peers: 50,
        }
    }
}

impl NodeNetwork {
    /// Create a new network node
    pub async fn new(
        dag_ledger: Arc<DAGLedger>,
        config: NetworkConfig,
    ) -> Result<Self, SDUPIError> {
        // Generate local peer identity
        let local_key = identity::Keypair::generate_ed25519();
        let peer_id = PeerId::from(local_key.public());
        
        // Create transport
        let transport = TokioTcpConfig::new()
            .nodelay(true)
            .upgrade(upgrade::Version::V1)
            .authenticate(libp2p::noise::NoiseAuthenticated::xx(&local_key).unwrap())
            .multiplex(libp2p::yamux::YamuxConfig::default())
            .boxed();
        
        // Create network behavior
        let behaviour = SDUPINetworkBehaviour::new(peer_id);
        
        // Create swarm
        let mut swarm = Swarm::new(transport, behaviour, peer_id);
        
        // Listen on address
        swarm.listen_on(config.listen_addr.parse()
            .map_err(|e| SDUPIError::Network(format!("Invalid listen address: {}", e)))?)?;
        
        // Create message channel
        let (message_sender, mut message_receiver) = mpsc::unbounded_channel();
        
        // Spawn message handler
        let swarm_clone = swarm.clone();
        tokio::spawn(async move {
            while let Some(message) = message_receiver.recv().await {
                // Handle incoming messages
                Self::handle_network_message(&swarm_clone, message).await;
            }
        });
        
        Ok(Self {
            peer_id,
            swarm,
            dag_ledger,
            peers: Arc::new(RwLock::new(HashMap::new())),
            message_sender,
            config,
        })
    }
    
    /// Start the network node
    pub async fn start(&mut self) -> Result<(), SDUPIError> {
        tracing::info!("Starting SDUPI network node: {}", self.peer_id);
        
        // Start heartbeat
        self.start_heartbeat().await?;
        
        // Start peer discovery
        self.start_peer_discovery().await?;
        
        Ok(())
    }
    
    /// Start heartbeat mechanism
    async fn start_heartbeat(&self) -> Result<(), SDUPIError> {
        let message_sender = self.message_sender.clone();
        let node_id = self.peer_id.to_string();
        let interval = self.config.heartbeat_interval;
        
        tokio::spawn(async move {
            let mut interval_timer = tokio::time::interval(interval);
            let start_time = Instant::now();
            
            loop {
                interval_timer.tick().await;
                
                let uptime = start_time.elapsed().as_secs();
                let heartbeat = NetworkMessage::Heartbeat {
                    node_id: node_id.clone(),
                    timestamp: chrono::Utc::now().timestamp() as u64,
                    uptime,
                };
                
                if let Err(e) = message_sender.send(heartbeat) {
                    tracing::error!("Failed to send heartbeat: {}", e);
                }
            }
        });
        
        Ok(())
    }
    
    /// Start peer discovery
    async fn start_peer_discovery(&self) -> Result<(), SDUPIError> {
        let message_sender = self.message_sender.clone();
        let node_id = self.peer_id.to_string();
        let interval = Duration::from_secs(60); // Discover peers every minute
        
        tokio::spawn(async move {
            let mut interval_timer = tokio::time::interval(interval);
            
            loop {
                interval_timer.tick().await;
                
                let discovery = NetworkMessage::PeerDiscovery {
                    node_id: node_id.clone(),
                    peers: Vec::new(), // TODO: Get actual peer list
                    timestamp: chrono::Utc::now().timestamp() as u64,
                };
                
                if let Err(e) = message_sender.send(discovery) {
                    tracing::error!("Failed to send peer discovery: {}", e);
                }
            }
        });
        
        Ok(())
    }
    
    /// Handle network message
    async fn handle_network_message(
        swarm: &Swarm<SDUPINetworkBehaviour>,
        message: NetworkMessage,
    ) {
        match message {
            NetworkMessage::NewTransaction { transaction, .. } => {
                // Process new transaction
                tracing::info!("Processing new transaction: {}", transaction.id);
            }
            NetworkMessage::ValidationRequest { transaction_id, validator, .. } => {
                // Process validation request
                tracing::info!("Processing validation request from {} for {}", validator, transaction_id);
            }
            NetworkMessage::DAGSyncRequest { from_transaction, limit, .. } => {
                // Process DAG sync request
                tracing::info!("Processing DAG sync request from {:?}, limit: {}", from_transaction, limit);
            }
            _ => {
                // Handle other message types
                tracing::debug!("Processing network message: {:?}", message);
            }
        }
    }
    
    /// Broadcast new transaction
    pub async fn broadcast_transaction(&self, transaction: &Transaction) -> Result<(), SDUPIError> {
        let message = NetworkMessage::NewTransaction {
            transaction: transaction.clone(),
            timestamp: chrono::Utc::now().timestamp() as u64,
        };
        
        self.message_sender.send(message)
            .map_err(|e| SDUPIError::Network(format!("Failed to send message: {}", e)))?;
        
        Ok(())
    }
    
    /// Request transaction validation
    pub async fn request_validation(&self, transaction_id: Uuid, validator: &str) -> Result<(), SDUPIError> {
        let message = NetworkMessage::ValidationRequest {
            transaction_id,
            validator: validator.to_string(),
            timestamp: chrono::Utc::now().timestamp() as u64,
        };
        
        self.message_sender.send(message)
            .map_err(|e| SDUPIError::Network(format!("Failed to send message: {}", e)))?;
        
        Ok(())
    }
    
    /// Get network statistics
    pub fn get_statistics(&self) -> Result<NetworkStats, SDUPIError> {
        let peers = self.peers.read()
            .map_err(|_| SDUPIError::Storage("Failed to acquire read lock".to_string()))?;
        
        Ok(NetworkStats {
            peer_id: self.peer_id.to_string(),
            total_peers: peers.len(),
            connected_peers: peers.values().filter(|p| p.is_connected).count(),
            node_type: NodeType::Full, // TODO: Make configurable
        })
    }
    
    /// Run network event loop
    pub async fn run(&mut self) -> Result<(), SDUPIError> {
        loop {
            tokio::select! {
                swarm_event = self.swarm.next_event() => {
                    if let Some(event) = swarm_event {
                        // Handle swarm events
                        tracing::debug!("Swarm event: {:?}", event);
                    }
                }
            }
        }
    }
}

/// Network statistics
#[derive(Debug, Clone)]
pub struct NetworkStats {
    pub peer_id: String,
    pub total_peers: usize,
    pub connected_peers: usize,
    pub node_type: NodeType,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dag::DAGLedger;
    
    #[tokio::test]
    async fn test_network_config_default() {
        let config = NetworkConfig::default();
        assert_eq!(config.max_peers, 50);
        assert_eq!(config.heartbeat_interval, Duration::from_secs(30));
    }
    
    #[test]
    fn test_peer_info_creation() {
        let peer_id = PeerId::random();
        let peer_info = PeerInfo {
            peer_id,
            address: "127.0.0.1:8080".to_string(),
            last_seen: Instant::now(),
            is_connected: true,
            node_type: NodeType::Full,
        };
        
        assert_eq!(peer_info.peer_id, peer_id);
        assert!(peer_info.is_connected);
    }
}

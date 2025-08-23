use ed25519_dalek::{Keypair, PublicKey as Ed25519PublicKey, SecretKey, Signature, Verifier};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use std::fmt;

/// Public key for SDUPI blockchain
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct PublicKey {
    inner: Ed25519PublicKey,
}

/// Key pair for signing transactions
#[derive(Debug, Clone)]
pub struct KeyPair {
    inner: Keypair,
}

impl PublicKey {
    /// Create a public key from bytes
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, crate::SDUPIError> {
        let inner = Ed25519PublicKey::from_bytes(bytes)
            .map_err(|e| crate::SDUPIError::Crypto(format!("Invalid public key bytes: {}", e)))?;
        Ok(Self { inner })
    }
    
    /// Get public key as bytes
    pub fn to_bytes(&self) -> [u8; 32] {
        self.inner.to_bytes()
    }
    
    /// Verify a signature
    pub fn verify(&self, message: &[u8], signature: &[u8]) -> Result<(), crate::SDUPIError> {
        let sig = Signature::from_bytes(signature)
            .map_err(|e| crate::SDUPIError::Crypto(format!("Invalid signature: {}", e)))?;
        
        self.inner
            .verify(message, &sig)
            .map_err(|e| crate::SDUPIError::Crypto(format!("Signature verification failed: {}", e)))?;
        
        Ok(())
    }
}

impl KeyPair {
    /// Generate a new key pair
    pub fn generate() -> Self {
        let inner = Keypair::generate(&mut OsRng);
        Self { inner }
    }
    
    /// Create key pair from secret key bytes
    pub fn from_secret_key_bytes(bytes: &[u8]) -> Result<Self, crate::SDUPIError> {
        let secret_key = SecretKey::from_bytes(bytes)
            .map_err(|e| crate::SDUPIError::Crypto(format!("Invalid secret key: {}", e)))?;
        
        let public_key = (&secret_key).into();
        let inner = Keypair {
            secret: secret_key,
            public: public_key,
        };
        
        Ok(Self { inner })
    }
    
    /// Get the public key
    pub fn public_key(&self) -> PublicKey {
        PublicKey {
            inner: self.inner.public,
        }
    }
    
    /// Get the secret key bytes
    pub fn secret_key_bytes(&self) -> [u8; 32] {
        self.inner.secret.to_bytes()
    }
    
    /// Sign a message
    pub fn sign(&self, message: &[u8]) -> Vec<u8> {
        let signature = self.inner.sign(message);
        signature.to_bytes().to_vec()
    }
    
    /// Sign a transaction
    pub fn sign_transaction(&self, transaction_hash: &[u8]) -> Vec<u8> {
        self.sign(transaction_hash)
    }
}

impl fmt::Display for PublicKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", hex::encode(self.to_bytes()))
    }
}

impl fmt::Display for KeyPair {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "KeyPair({})", self.public_key())
    }
}

/// Cryptographic utilities
pub mod utils {
    use super::*;
    use sha2::{Sha256, Digest};
    
    /// Hash data using SHA-256
    pub fn sha256(data: &[u8]) -> Vec<u8> {
        let mut hasher = Sha256::new();
        hasher.update(data);
        hasher.finalize().to_vec()
    }
    
    /// Generate a random nonce
    pub fn random_nonce() -> [u8; 32] {
        let mut nonce = [0u8; 32];
        OsRng.fill(&mut nonce);
        nonce
    }
    
    /// Verify transaction signature
    pub fn verify_transaction_signature(
        public_key: &PublicKey,
        transaction_hash: &[u8],
        signature: &[u8],
    ) -> Result<(), crate::SDUPIError> {
        public_key.verify(transaction_hash, signature)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_keypair_generation() {
        let keypair = KeyPair::generate();
        let public_key = keypair.public_key();
        
        assert_eq!(public_key.to_bytes().len(), 32);
    }
    
    #[test]
    fn test_message_signing_and_verification() {
        let keypair = KeyPair::generate();
        let message = b"Hello, SDUPI!";
        
        let signature = keypair.sign(message);
        let public_key = keypair.public_key();
        
        assert!(public_key.verify(message, &signature).is_ok());
    }
    
    #[test]
    fn test_invalid_signature_rejection() {
        let keypair = KeyPair::generate();
        let public_key = keypair.public_key();
        let message = b"Hello, SDUPI!";
        
        let invalid_signature = vec![0u8; 64];
        
        assert!(public_key.verify(message, &invalid_signature).is_err());
    }
    
    #[test]
    fn test_keypair_serialization() {
        let keypair = KeyPair::generate();
        let public_key = keypair.public_key();
        
        let serialized = serde_json::to_string(&public_key).unwrap();
        let deserialized: PublicKey = serde_json::from_str(&serialized).unwrap();
        
        assert_eq!(public_key, deserialized);
    }
}

/**
 * 🚀 SDUPI Blockchain Custom Hook
 * Provides easy access to blockchain functionality throughout the frontend
 * REAL-TIME DATA FROM BACKEND BLOCKCHAIN
 */

import { useState, useEffect, useCallback } from 'react';
import { sdupiBlockchain, RealBlockchainData, SDUPINetworkStats, SDUPITransaction, SDUPIStakingInfo } from '@/lib/sdupi-blockchain';

export const useSDUPIBlockchain = () => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [sdupiBalance, setSdupiBalance] = useState('0');
  const [realTimeData, setRealTimeData] = useState<RealBlockchainData | null>(null);
  const [networkStats, setNetworkStats] = useState<SDUPINetworkStats | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<SDUPITransaction[]>([]);
  const [stakingInfo, setStakingInfo] = useState<SDUPIStakingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize blockchain connection and real-time data
  useEffect(() => {
    const initializeBlockchain = async () => {
      try {
        // Check if wallet is already connected
        if (sdupiBlockchain.isWalletConnected()) {
          const account = sdupiBlockchain.getCurrentAccount();
          if (account) {
            setIsConnected(true);
            setCurrentAccount(account);
            await loadAccountData(account);
          }
        }

        // Subscribe to real-time blockchain data
        const unsubscribe = sdupiBlockchain.subscribeToData((data) => {
          setRealTimeData(data);
          
          // Extract network stats from real-time data
          if (data.network) {
            setNetworkStats({
              tps: data.network.tps,
              latency: data.network.latency,
              nodes: data.network.nodes,
              consensusTime: data.network.consensusTime,
              blockHeight: data.network.blockHeight,
              totalTransactions: data.network.totalTransactions,
              activeWallets: data.network.activeWallets,
              networkHealth: data.network.networkHealth
            });
          }

          // Extract transaction history from real-time data
          if (data.blockchain && data.blockchain.latestTransactions) {
            const transactions = data.blockchain.latestTransactions.map(tx => ({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              timestamp: tx.timestamp,
              status: tx.status
            }));
            setTransactionHistory(transactions);
          }
        });

        // Load initial data
        const initialData = sdupiBlockchain.getRealTimeData();
        if (initialData) {
          setRealTimeData(initialData);
          if (initialData.network) {
            setNetworkStats({
              tps: initialData.network.tps,
              latency: initialData.network.latency,
              nodes: initialData.network.nodes,
              consensusTime: initialData.network.consensusTime,
              blockHeight: initialData.network.blockHeight,
              totalTransactions: initialData.network.totalTransactions,
              activeWallets: initialData.network.activeWallets,
              networkHealth: initialData.network.networkHealth
            });
          }
        }

        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.error('Failed to initialize blockchain:', err);
        setError('Failed to initialize blockchain connection');
      }
    };

    initializeBlockchain();
  }, []);

  // Load account data
  const loadAccountData = useCallback(async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load balance
      const balance = await sdupiBlockchain.getSDUPIBalance(address);
      setSdupiBalance(balance);

      // Load staking info
      const staking = await sdupiBlockchain.getStakingInfo(address);
      setStakingInfo(staking);
    } catch (err) {
      console.error('Failed to load account data:', err);
      setError('Failed to load account data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accounts = await sdupiBlockchain.connectWallet();
      
      if (accounts.length > 0) {
        const account = accounts[0];
        setIsConnected(true);
        setCurrentAccount(account);
        await loadAccountData(account);
        
        console.log('✅ Wallet connected successfully:', account);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
    } finally {
      setIsLoading(false);
    }
  }, [loadAccountData]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    try {
      sdupiBlockchain.disconnectWallet();
      setIsConnected(false);
      setCurrentAccount(null);
      setSdupiBalance('0');
      setTransactionHistory([]);
      setStakingInfo(null);
      
      console.log('🔌 Wallet disconnected successfully');
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      setError('Failed to disconnect wallet');
    }
  }, []);

  // Send SDUPI tokens
  const sendSDUPI = useCallback(async (to: string, amount: string) => {
    try {
      if (!isConnected || !currentAccount) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      const txHash = await sdupiBlockchain.sendSDUPI(to, amount);
      
      // Reload account data after transaction
      await loadAccountData(currentAccount);
      
      console.log('✅ SDUPI sent successfully:', txHash);
      return txHash;
    } catch (err) {
      console.error('Failed to send SDUPI:', err);
      setError('Failed to send SDUPI. Please check your balance and try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, currentAccount, loadAccountData]);

  // Stake SDUPI tokens
  const stakeSDUPI = useCallback(async (amount: string) => {
    try {
      if (!isConnected || !currentAccount) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      const txHash = await sdupiBlockchain.stakeSDUPI(amount);
      
      // Reload account data after staking
      await loadAccountData(currentAccount);
      
      console.log('✅ SDUPI staked successfully:', txHash);
      return txHash;
    } catch (err) {
      console.error('Failed to stake SDUPI:', err);
      setError('Failed to stake SDUPI. Please check your balance and try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, currentAccount, loadAccountData]);

  // Deploy smart contract
  const deploySmartContract = useCallback(async (contractCode: string, constructorArgs: any[] = []) => {
    try {
      if (!isConnected || !currentAccount) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      const contractAddress = await sdupiBlockchain.deploySmartContract(contractCode, constructorArgs);
      
      console.log('✅ Smart contract deployed successfully:', contractAddress);
      return contractAddress;
    } catch (err) {
      console.error('Failed to deploy smart contract:', err);
      setError('Failed to deploy smart contract. Please check your wallet and try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, currentAccount]);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (currentAccount) {
      await loadAccountData(currentAccount);
    }
  }, [currentAccount, loadAccountData]);

  // Get real-time blockchain data
  const getBlockchainData = useCallback(() => {
    return realTimeData;
  }, [realTimeData]);

  // Get latest blocks
  const getLatestBlocks = useCallback(() => {
    return realTimeData?.blockchain?.latestBlocks || [];
  }, [realTimeData]);

  // Get latest transactions
  const getLatestTransactions = useCallback(() => {
    return realTimeData?.blockchain?.latestTransactions || [];
  }, [realTimeData]);

  // Get DeFi data
  const getDeFiData = useCallback(() => {
    return realTimeData?.defi || null;
  }, [realTimeData]);

  // Get mempool data
  const getMempoolData = useCallback(() => {
    return realTimeData?.blockchain?.mempool || null;
  }, [realTimeData]);

  return {
    // State
    isConnected,
    currentAccount,
    sdupiBalance,
    realTimeData,
    networkStats,
    transactionHistory,
    stakingInfo,
    isLoading,
    error,

    // Actions
    connectWallet,
    disconnectWallet,
    sendSDUPI,
    stakeSDUPI,
    deploySmartContract,
    refreshData,

    // Real-time data getters
    getBlockchainData,
    getLatestBlocks,
    getLatestTransactions,
    getDeFiData,
    getMempoolData,

    // Blockchain instance
    blockchain: sdupiBlockchain,
  };
};

// Export the hook
export default useSDUPIBlockchain;

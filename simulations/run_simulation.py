#!/usr/bin/env python3
"""
SDUPI Blockchain Simulation
===========================

This script simulates the SDUPI blockchain network to test performance,
consensus, and scalability features as specified in the PRD.

Target: 1,000 TPS with 100ms latency
"""

import asyncio
import argparse
import time
import statistics
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class SimulationConfig:
    """Configuration for the simulation"""
    num_nodes: int = 10
    num_transactions: int = 1000
    duration_seconds: int = 60
    target_tps: int = 1000
    target_latency_ms: int = 100
    max_failure_rate: float = 0.0001  # 0.01%
    dag_tips: int = 100
    consensus_rounds: int = 3
    fpc_threshold: float = 0.67

@dataclass
class TransactionMetrics:
    """Metrics for a single transaction"""
    transaction_id: str
    created_at: float
    validated_at: float = None
    confirmed_at: float = None
    latency_ms: float = None
    status: str = "pending"
    node_id: str = None

@dataclass
class NodeMetrics:
    """Metrics for a single node"""
    node_id: str
    transactions_processed: int = 0
    validation_time: float = 0.0
    consensus_participation: int = 0
    uptime: float = 0.0
    errors: int = 0

@dataclass
class SimulationResults:
    """Results of the simulation"""
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    average_tps: float
    average_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    failure_rate: float
    total_duration: float
    node_metrics: List[NodeMetrics]
    transaction_metrics: List[TransactionMetrics]

class SDUPISimulation:
    """Main simulation class for SDUPI blockchain"""
    
    def __init__(self, config: SimulationConfig):
        self.config = config
        self.nodes: List[Dict[str, Any]] = []
        self.transactions: List[TransactionMetrics] = []
        self.node_metrics: Dict[str, NodeMetrics] = {}
        self.start_time = None
        self.end_time = None
        
    async def initialize_network(self):
        """Initialize the simulated network of nodes"""
        logger.info(f"Initializing network with {self.config.num_nodes} nodes...")
        
        for i in range(self.config.num_nodes):
            node = {
                'id': f'node-{i+1}',
                'type': 'full' if i < 8 else 'light',  # 8 full, 2 light nodes
                'stake': 10000 + (i * 1000),
                'status': 'active',
                'transactions': [],
                'peers': []
            }
            
            # Add peer connections
            for j in range(self.config.num_nodes):
                if i != j:
                    node['peers'].append(f'node-{j+1}')
            
            self.nodes.append(node)
            
            # Initialize node metrics
            self.node_metrics[node['id']] = NodeMetrics(
                node_id=node['id'],
                transactions_processed=0,
                validation_time=0.0,
                consensus_participation=0,
                uptime=0.0,
                errors=0
            )
        
        logger.info("Network initialization completed")
    
    async def generate_transactions(self):
        """Generate transactions for the simulation"""
        logger.info(f"Generating {self.config.num_transactions} transactions...")
        
        for i in range(self.config.num_transactions):
            transaction = TransactionMetrics(
                transaction_id=f'tx-{i+1:06d}',
                created_at=time.time(),
                status='pending'
            )
            self.transactions.append(transaction)
        
        logger.info("Transaction generation completed")
    
    async def simulate_consensus_round(self, round_num: int):
        """Simulate a consensus round"""
        logger.info(f"Starting consensus round {round_num}")
        
        # Simulate transaction validation
        validation_start = time.time()
        
        # Process transactions in batches to achieve target TPS
        batch_size = max(1, self.config.target_tps // 10)  # 10 batches per second
        total_batches = (self.config.num_transactions + batch_size - 1) // batch_size
        
        for batch_idx in range(total_batches):
            start_idx = batch_idx * batch_size
            end_idx = min(start_idx + batch_size, self.config.num_transactions)
            
            batch_start = time.time()
            
            # Process batch
            await self.process_transaction_batch(start_idx, end_idx)
            
            # Calculate delay to maintain target TPS
            batch_duration = time.time() - batch_start
            target_batch_duration = batch_size / self.config.target_tps
            
            if batch_duration < target_batch_duration:
                await asyncio.sleep(target_batch_duration - batch_duration)
        
        validation_duration = time.time() - validation_start
        logger.info(f"Consensus round {round_num} completed in {validation_duration:.2f}s")
        
        return validation_duration
    
    async def process_transaction_batch(self, start_idx: int, end_idx: int):
        """Process a batch of transactions"""
        tasks = []
        
        for i in range(start_idx, end_idx):
            if i < len(self.transactions):
                task = asyncio.create_task(self.process_single_transaction(i))
                tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks)
    
    async def process_single_transaction(self, tx_idx: int):
        """Process a single transaction"""
        transaction = self.transactions[tx_idx]
        
        # Simulate network propagation delay
        propagation_delay = 0.001 + (hash(transaction.transaction_id) % 100) / 100000  # 1-2ms
        await asyncio.sleep(propagation_delay)
        
        # Simulate validation by multiple nodes
        validation_delay = 0.005 + (hash(transaction.transaction_id) % 50) / 100000  # 5-6ms
        await asyncio.sleep(validation_delay)
        
        # Simulate consensus participation
        consensus_delay = 0.010 + (hash(transaction.transaction_id) % 100) / 100000  # 10-11ms
        await asyncio.sleep(consensus_delay)
        
        # Update transaction status
        transaction.validated_at = time.time()
        transaction.status = 'validated'
        
        # Simulate confirmation
        confirmation_delay = 0.020 + (hash(transaction.transaction_id) % 80) / 100000  # 20-21ms
        await asyncio.sleep(confirmation_delay)
        
        transaction.confirmed_at = time.time()
        transaction.status = 'confirmed'
        
        # Calculate latency
        transaction.latency_ms = (transaction.confirmed_at - transaction.created_at) * 1000
        
        # Update node metrics
        for node in self.nodes:
            if node['status'] == 'active':
                self.node_metrics[node['id']].transactions_processed += 1
                self.node_metrics[node['id']].consensus_participation += 1
    
    async def run_simulation(self) -> SimulationResults:
        """Run the complete simulation"""
        logger.info("Starting SDUPI blockchain simulation...")
        self.start_time = time.time()
        
        try:
            # Initialize network
            await self.initialize_network()
            
            # Generate transactions
            await self.generate_transactions()
            
            # Run consensus rounds
            total_validation_time = 0
            for round_num in range(self.config.consensus_rounds):
                round_time = await self.simulate_consensus_round(round_num + 1)
                total_validation_time += round_time
            
            # Finalize simulation
            self.end_time = time.time()
            
            # Calculate results
            results = self.calculate_results(total_validation_time)
            
            logger.info("Simulation completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"Simulation failed: {e}")
            raise
    
    def calculate_results(self, total_validation_time: float) -> SimulationResults:
        """Calculate simulation results and metrics"""
        total_duration = self.end_time - self.start_time
        
        # Calculate transaction metrics
        successful_transactions = len([t for t in self.transactions if t.status == 'confirmed'])
        failed_transactions = len(self.transactions) - successful_transactions
        failure_rate = failed_transactions / len(self.transactions) if self.transactions else 0
        
        # Calculate TPS
        average_tps = successful_transactions / total_duration if total_duration > 0 else 0
        
        # Calculate latency metrics
        latencies = [t.latency_ms for t in self.transactions if t.latency_ms is not None]
        average_latency_ms = statistics.mean(latencies) if latencies else 0
        p95_latency_ms = statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else 0
        p99_latency_ms = statistics.quantiles(latencies, n=100)[98] if len(latencies) >= 100 else 0
        
        # Update node metrics
        for node_id, metrics in self.node_metrics.items():
            metrics.uptime = total_duration
        
        return SimulationResults(
            total_transactions=len(self.transactions),
            successful_transactions=successful_transactions,
            failed_transactions=failed_transactions,
            average_tps=average_tps,
            average_latency_ms=average_latency_ms,
            p95_latency_ms=p95_latency_ms,
            p99_latency_ms=p99_latency_ms,
            failure_rate=failure_rate,
            total_duration=total_duration,
            node_metrics=list(self.node_metrics.values()),
            transaction_metrics=self.transactions
        )
    
    def print_results(self, results: SimulationResults):
        """Print simulation results"""
        print("\n" + "="*60)
        print("SDUPI BLOCKCHAIN SIMULATION RESULTS")
        print("="*60)
        
        print(f"Total Transactions: {results.total_transactions:,}")
        print(f"Successful Transactions: {results.successful_transactions:,}")
        print(f"Failed Transactions: {results.failed_transactions:,}")
        print(f"Failure Rate: {results.failure_rate:.4%}")
        print()
        
        print(f"Performance Metrics:")
        print(f"  Average TPS: {results.average_tps:.2f}")
        print(f"  Target TPS: {self.config.target_tps:,}")
        print(f"  TPS Achievement: {(results.average_tps/self.config.target_tps)*100:.1f}%")
        print()
        
        print(f"Latency Metrics:")
        print(f"  Average Latency: {results.average_latency_ms:.2f} ms")
        print(f"  95th Percentile: {results.p95_latency_ms:.2f} ms")
        print(f"  99th Percentile: {results.p99_latency_ms:.2f} ms")
        print(f"  Target Latency: {self.config.target_latency_ms} ms")
        print()
        
        print(f"Simulation Duration: {results.total_duration:.2f} seconds")
        
        # Check success criteria
        print("\n" + "="*60)
        print("SUCCESS CRITERIA EVALUATION")
        print("="*60)
        
        tps_success = results.average_tps >= self.config.target_tps
        latency_success = results.average_latency_ms <= self.config.target_latency_ms
        failure_success = results.failure_rate <= self.config.max_failure_rate
        
        print(f"✅ TPS Target ({self.config.target_tps:,}): {'PASSED' if tps_success else 'FAILED'}")
        print(f"✅ Latency Target ({self.config.target_latency_ms}ms): {'PASSED' if latency_success else 'FAILED'}")
        print(f"✅ Failure Rate Target ({self.config.max_failure_rate:.4%}): {'PASSED' if failure_success else 'FAILED'}")
        
        overall_success = tps_success and latency_success and failure_success
        print(f"\n🎯 Overall Result: {'PASSED' if overall_success else 'FAILED'}")
        
        print("="*60)

async def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='SDUPI Blockchain Simulation')
    parser.add_argument('--nodes', type=int, default=10, help='Number of nodes in the network')
    parser.add_argument('--transactions', type=int, default=1000, help='Number of transactions to process')
    parser.add_argument('--duration', type=int, default=60, help='Simulation duration in seconds')
    parser.add_argument('--target-tps', type=int, default=1000, help='Target transactions per second')
    parser.add_argument('--target-latency', type=int, default=100, help='Target latency in milliseconds')
    parser.add_argument('--output', type=str, help='Output file for results (JSON)')
    
    args = parser.parse_args()
    
    # Create simulation configuration
    config = SimulationConfig(
        num_nodes=args.nodes,
        num_transactions=args.transactions,
        duration_seconds=args.duration,
        target_tps=args.target_tps,
        target_latency_ms=args.target_latency
    )
    
    # Create and run simulation
    simulation = SDUPISimulation(config)
    results = await simulation.run_simulation()
    
    # Print results
    simulation.print_results(results)
    
    # Save results to file if specified
    if args.output:
        with open(args.output, 'w') as f:
            json.dump({
                'config': {
                    'num_nodes': config.num_nodes,
                    'num_transactions': config.num_transactions,
                    'target_tps': config.target_tps,
                    'target_latency_ms': config.target_latency_ms
                },
                'results': {
                    'total_transactions': results.total_transactions,
                    'successful_transactions': results.successful_transactions,
                    'failed_transactions': results.failed_transactions,
                    'average_tps': results.average_tps,
                    'average_latency_ms': results.average_latency_ms,
                    'p95_latency_ms': results.p95_latency_ms,
                    'p99_latency_ms': results.p99_latency_ms,
                    'failure_rate': results.failure_rate,
                    'total_duration': results.total_duration
                }
            }, f, indent=2)
        print(f"\nResults saved to: {args.output}")

if __name__ == "__main__":
    asyncio.run(main())

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SDUPI Token
 * @dev SDUPI Testnet Token with Staking and Governance
 * Total Supply: 100,000,000,000 SDUPI
 * Decimals: 18
 */
contract SDUPIToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // Staking structures
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod;
        uint256 rewards;
        bool isActive;
    }
    
    struct StakingPool {
        uint256 totalStaked;
        uint256 totalRewards;
        uint256 apy;
        uint256 lockPeriod;
        bool isActive;
    }
    
    // Constants
    uint256 public constant TOTAL_SUPPLY = 100_000_000_000 * 10**18; // 100 billion SDUPI
    uint256 public constant MIN_STAKE = 1_000_000 * 10**18; // 1M SDUPI minimum
    uint256 public constant MAX_STAKE = 10_000_000_000 * 10**18; // 10B SDUPI maximum
    
    // State variables
    mapping(address => Stake) public stakes;
    mapping(address => uint256) public stakingRewards;
    StakingPool public stakingPool;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    event StakingPoolUpdated(uint256 apy, uint256 lockPeriod);
    
    constructor() ERC20("SDUPI Token", "SDUPI") {
        _mint(msg.sender, TOTAL_SUPPLY);
        
        // Initialize staking pool
        stakingPool = StakingPool({
            totalStaked: 0,
            totalRewards: 0,
            apy: 15, // 15% APY
            lockPeriod: 30 days,
            isActive: true
        });
    }
    
    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than 0");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external override {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Stake tokens
     */
    function stake(uint256 amount) external nonReentrant {
        require(stakingPool.isActive, "Staking is not active");
        require(amount >= MIN_STAKE, "Amount below minimum stake");
        require(amount <= MAX_STAKE, "Amount above maximum stake");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(stakes[msg.sender].amount == 0, "Already staked");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Create stake
        stakes[msg.sender] = Stake({
            amount: amount,
            timestamp: block.timestamp,
            lockPeriod: stakingPool.lockPeriod,
            rewards: 0,
            isActive: true
        });
        
        // Update pool
        stakingPool.totalStaked += amount;
        
        emit Staked(msg.sender, amount, stakingPool.lockPeriod);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstake() external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.isActive, "No active stake");
        require(block.timestamp >= userStake.timestamp + userStake.lockPeriod, "Lock period not ended");
        
        uint256 amount = userStake.amount;
        uint256 rewards = calculateRewards(msg.sender);
        
        // Reset stake
        delete stakes[msg.sender];
        
        // Update pool
        stakingPool.totalStaked -= amount;
        stakingPool.totalRewards += rewards;
        
        // Transfer tokens and rewards
        _transfer(address(this), msg.sender, amount);
        _mint(msg.sender, rewards);
        
        emit Unstaked(msg.sender, amount, rewards);
    }
    
    /**
     * @dev Calculate staking rewards
     */
    function calculateRewards(address user) public view returns (uint256) {
        Stake storage userStake = stakes[user];
        if (!userStake.isActive) return 0;
        
        uint256 timeStaked = block.timestamp - userStake.timestamp;
        uint256 annualReward = (userStake.amount * stakingPool.apy) / 100;
        uint256 reward = (annualReward * timeStaked) / 365 days;
        
        return reward;
    }
    
    /**
     * @dev Claim rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards to claim");
        
        // Update stake timestamp to reset rewards
        stakes[msg.sender].timestamp = block.timestamp;
        
        // Mint rewards
        _mint(msg.sender, rewards);
        stakingPool.totalRewards += rewards;
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Get staking info for user
     */
    function getStakingInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 stakingTime,
        uint256 lockEndTime,
        uint256 currentRewards,
        bool isStaked
    ) {
        Stake storage userStake = stakes[user];
        if (userStake.isActive) {
            return (
                userStake.amount,
                userStake.timestamp,
                userStake.timestamp + userStake.lockPeriod,
                calculateRewards(user),
                true
            );
        }
        return (0, 0, 0, 0, false);
    }
    
    /**
     * @dev Update staking pool parameters (only owner)
     */
    function updateStakingPool(uint256 newApy, uint256 newLockPeriod) external onlyOwner {
        stakingPool.apy = newApy;
        stakingPool.lockPeriod = newLockPeriod;
        emit StakingPoolUpdated(newApy, newLockPeriod);
    }
    
    /**
     * @dev Pause/unpause staking (only owner)
     */
    function setStakingActive(bool active) external onlyOwner {
        stakingPool.isActive = active;
    }
    
    /**
     * @dev Get staking pool info
     */
    function getStakingPoolInfo() external view returns (
        uint256 totalStaked,
        uint256 totalRewards,
        uint256 apy,
        uint256 lockPeriod,
        bool isActive
    ) {
        return (
            stakingPool.totalStaked,
            stakingPool.totalRewards,
            stakingPool.apy,
            stakingPool.lockPeriod,
            stakingPool.isActive
        );
    }
    
    /**
     * @dev Pause token transfers (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override required functions
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
} 
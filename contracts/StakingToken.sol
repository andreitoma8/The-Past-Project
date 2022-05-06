// SPDX-License-Identifier: MIT
// Creator: andreitoma8
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract StakingToken is ReentrancyGuard {
    // Address and Interface to the $PAST Token
    IERC20 public pastToken;

    // Staker info
    struct Staker {
        // The deposited tokens of the Staker
        uint256 deposited;
        // Last time of details update for Deposit
        uint256 timeOfLastUpdate;
        // Calculated, but unclaimed rewards. These are calculated each time
        // a user writes to the contract.
        uint256 unclaimedRewards;
        // The timestamp since user has more than 1 billion tokens staked
        uint256 timeStakedForReward;
    }

    // Rewards per hour. A fraction calculated as x/10.000.000 to get the percentage
    uint256 public rewardsPerHour = 246; // 0.00274%/h or 21.56% APR or 24% APY with daily compounding.

    // Minimum amount to stake
    uint256 public minStake = 10 * 10**9;

    // Minimum stake to get rewards(1 billion)
    uint256 public minStakeForReward = 1000000000 * 10**9;

    // Compounding frequency limit in seconds
    uint256 public compoundFreq = 86400; //1 Day

    // Mapping of address to Staker info
    mapping(address => Staker) internal stakers;

    // Constructor function
    constructor(IERC20 _pastToken) {
        pastToken = _pastToken;
    }

    // If address has no Staker struct, initiate one. If address already was a stake,
    // calculate the rewards and add them to unclaimedRewards, reset the last time of
    // deposit and then add _amount to the already deposited amount.
    // REceive the amount staked.
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount >= minStake, "Amount smaller than minimimum deposit");
        require(
            pastToken.balanceOf(msg.sender) >= _amount,
            "Can't stake more than you own"
        );
        if (stakers[msg.sender].deposited == 0) {
            stakers[msg.sender].deposited = _amount;
            stakers[msg.sender].timeOfLastUpdate = block.timestamp;
            stakers[msg.sender].unclaimedRewards = 0;
        } else {
            uint256 rewards = calculateRewards(msg.sender);
            stakers[msg.sender].unclaimedRewards += rewards;
            stakers[msg.sender].deposited += _amount;
            stakers[msg.sender].timeOfLastUpdate = block.timestamp;
        }
        if (
            stakers[msg.sender].deposited >= minStakeForReward &&
            stakers[msg.sender].timeStakedForReward == 0
        ) {
            stakers[msg.sender].timeStakedForReward = block.timestamp;
        }
        pastToken.transferFrom(msg.sender, address(this), _amount);
    }

    // Compound the rewards and reset the last time of update for Deposit info
    function stakeRewards() external nonReentrant {
        require(stakers[msg.sender].deposited > 0, "You have no deposit");
        require(
            compoundRewardsTimer(msg.sender) == 0,
            "Tried to compound rewars too soon"
        );
        uint256 rewards = calculateRewards(msg.sender) +
            stakers[msg.sender].unclaimedRewards;
        stakers[msg.sender].unclaimedRewards = 0;
        stakers[msg.sender].deposited += rewards;
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
        if (
            stakers[msg.sender].deposited >= minStakeForReward &&
            stakers[msg.sender].timeStakedForReward == 0
        ) {
            stakers[msg.sender].timeStakedForReward = block.timestamp;
        }
    }

    // Send rewards for msg.sender
    function claimRewards() external nonReentrant {
        uint256 rewards = calculateRewards(msg.sender) +
            stakers[msg.sender].unclaimedRewards;
        require(rewards > 0, "You have no rewards");
        stakers[msg.sender].unclaimedRewards = 0;
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
        pastToken.transferFrom(address(this), msg.sender, rewards);
    }

    // Withdraw specified amount of staked tokens
    function withdraw(uint256 _amount) external nonReentrant {
        require(
            stakers[msg.sender].deposited >= _amount,
            "Can't withdraw more than you have"
        );
        uint256 _rewards = calculateRewards(msg.sender);
        stakers[msg.sender].deposited -= _amount;
        if (_amount == stakers[msg.sender].deposited) {
            stakers[msg.sender].timeOfLastUpdate = 0;
        } else {
            stakers[msg.sender].timeOfLastUpdate = block.timestamp;
        }
        stakers[msg.sender].unclaimedRewards = _rewards;
        if (stakers[msg.sender].deposited < minStakeForReward) {
            stakers[msg.sender].timeStakedForReward = 0;
        }
        pastToken.transferFrom(address(this), msg.sender, _amount);
    }

    // Withdraw all stake and rewards and mints them to the msg.sender
    function withdrawAll() external nonReentrant {
        require(stakers[msg.sender].deposited > 0, "You have no deposit");
        uint256 _rewards = calculateRewards(msg.sender) +
            stakers[msg.sender].unclaimedRewards;
        uint256 _deposit = stakers[msg.sender].deposited;
        stakers[msg.sender].deposited = 0;
        stakers[msg.sender].timeOfLastUpdate = 0;
        uint256 _amount = _rewards + _deposit;
        stakers[msg.sender].timeStakedForReward = 0;
        pastToken.transferFrom(address(this), msg.sender, _amount);
    }

    // Function useful for fron-end that returns user stake and rewards by address
    function getDepositInfo(address _user)
        public
        view
        returns (uint256 _stake, uint256 _rewards)
    {
        _stake = stakers[_user].deposited;
        _rewards =
            calculateRewards(_user) +
            stakers[msg.sender].unclaimedRewards;
        return (_stake, _rewards);
    }

    // Function to check if user has staked more than 1 billion tokens in the last 30 days
    function hasOneBillionStaked(address _user) external view returns (bool) {
        return (stakers[_user].timeStakedForReward + 2592000 > block.timestamp);
    }

    // Utility function that returns the timer for restaking rewards
    function compoundRewardsTimer(address _user)
        public
        view
        returns (uint256 _timer)
    {
        if (stakers[_user].timeOfLastUpdate + compoundFreq <= block.timestamp) {
            return 0;
        } else {
            return
                (stakers[_user].timeOfLastUpdate + compoundFreq) -
                block.timestamp;
        }
    }

    // Calculate the rewards since the last update on Deposit info
    function calculateRewards(address _staker)
        internal
        view
        returns (uint256 rewards)
    {
        if (stakers[_staker].timeOfLastUpdate == 0) {
            return 0;
        } else {
            return (((((block.timestamp - stakers[_staker].timeOfLastUpdate) *
                stakers[_staker].deposited) * rewardsPerHour) / 3600) /
                10000000);
        }
    }
}

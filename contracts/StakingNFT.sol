// SPDX-License-Identifier: MIT
// Creator: andreitoma8
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract StakingNFT is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Interfaces for ERC20 and ERC721
    IERC20 public immutable rewardsToken;
    IERC721 public immutable nftCollection;

    // Staker info
    struct Staker {
        // Amount of Colors staked
        uint256 amountOfColorsStaked;
        // Last time of details update for this User
        uint256 timeOfLastUpdate;
        // Calculated, but unclaimed rewards for the User. The rewards are
        // calculated each time the user writes to the Smart Contract
        uint256 unclaimedRewards;
        // The number of diferent colours staked
        uint256 coloursStakes;
    }

    // Colors state
    struct Colors {
        bool emerald;
        bool diamond;
        bool peridot;
        bool ruby;
        bool obsidian;
        bool amethyst;
        bool sapphire;
        bool rose;
        bool canary;
        bool citine;
        bool cerulean;
    }

    // Rewards per day per token deposited.
    uint256 private rewardsPerDay = 161150;

    // Ranges for colors
    uint256[] public colorsRanges = [
        0,
        303,
        606,
        909,
        1212,
        1515,
        1818,
        2121,
        2424,
        2727,
        3030,
        3333
    ];

    // Amounts of levels needed to multiply rewards
    uint256[] public rewardsThreshold = [3, 5, 7, 11];

    // Mapping of User Address to Staker info
    mapping(address => Staker) public stakers;

    // Mapping of Token Id to staker. Made for the SC to remeber
    // who to send back the ERC721 Token to.
    mapping(uint256 => address) public stakerAddress;

    // Mapping of staker to colors staked
    mapping(address => mapping(uint256 => bool)) public colorsStaked;

    // Constructor function
    constructor(IERC721 _nftCollection, IERC20 _rewardsToken) {
        nftCollection = _nftCollection;
        rewardsToken = _rewardsToken;
    }

    // Stake function. Pass the Token ID of the NFT and the Color of the NFT
    // Color. Colors have a ID from 0 to 10. Transfer NFT from user to this Smart Contract,
    // increment the amount of colors stked and map msg.sender to the Token Id of the staked
    // Token to later send back on withdrawal. Finally give timeOfLastUpdate the
    // value of now and set the color as already staked by the user.
    function stake(uint256 _tokenId, uint256 _color) external nonReentrant {
        require(_color < 11, "Color out of index!");
        require(!colorsStaked[msg.sender][_color], "Color already staked!");
        require(
            _tokenId > colorsRanges[_color] &&
                _tokenId <= colorsRanges[_color + 1],
            "Wrong color selected!"
        );
        require(
            nftCollection.ownerOf(_tokenId) == msg.sender,
            "Can't stake tokens you don't own!"
        );
        if (stakers[msg.sender].amountOfColorsStaked > 0) {
            uint256 rewards = calculateRewards(msg.sender);
            stakers[msg.sender].unclaimedRewards += rewards;
        }
        nftCollection.transferFrom(msg.sender, address(this), _tokenId);
        stakerAddress[_tokenId] = msg.sender;
        stakers[msg.sender].amountOfColorsStaked += 1;
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
        colorsStaked[msg.sender][_color] = true;
    }

    // Check if user has any  Tokens Staked, if color is in range and if the correct one
    // is selected. Calculate the rewards and store them in the unclaimedRewards and for each
    // ERC721 Token in param: check if msg.sender is the original staker, decrement
    // the amount of colors staked for user and transfer the token back to them.
    function withdraw(uint256 _tokenId, uint256 _color) external nonReentrant {
        require(
            stakers[msg.sender].amountOfColorsStaked > 0,
            "You have no tokens staked"
        );
        require(_color < 11, "Color out of index!");
        require(
            _tokenId > colorsRanges[_color] &&
                _tokenId <= colorsRanges[_color + 1],
            "Wrong color selected!"
        );
        uint256 rewards = calculateRewards(msg.sender);
        stakers[msg.sender].unclaimedRewards += rewards;
        require(stakerAddress[_tokenId] == msg.sender);
        stakerAddress[_tokenId] = address(0);
        nftCollection.transferFrom(address(this), msg.sender, _tokenId);
        stakers[msg.sender].amountOfColorsStaked -= 1;
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
        colorsStaked[msg.sender][_color] = false;
    }

    // Calculate rewards for the msg.sender, check if there are any rewards
    // claim, set unclaimedRewards to 0 and transfer the ERC20 Reward token
    // to the user.
    function claimRewards() external {
        uint256 rewards = calculateRewards(msg.sender) +
            stakers[msg.sender].unclaimedRewards;
        require(rewards > 0, "You have no rewards to claim");
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
        stakers[msg.sender].unclaimedRewards = 0;
        rewardsToken.safeTransfer(msg.sender, rewards);
    }

    //////////
    // View //
    //////////

    function userStakeInfo(address _user)
        public
        view
        returns (uint256 _tokensStaked, uint256 _availableRewards)
    {
        return (stakers[_user].amountOfColorsStaked, availableRewards(_user));
    }

    function availableRewards(address _user) internal view returns (uint256) {
        uint256 _rewards = stakers[_user].unclaimedRewards +
            calculateRewards(_user);
        return _rewards;
    }

    /////////////
    // Internal//
    /////////////

    // Calculate rewards for param _staker by calculating the time passed
    // since last update in hours and mulitplying it to ERC721 Tokens Staked
    // and rewardsPerHour.
    function calculateRewards(address _staker)
        internal
        view
        returns (uint256 _rewards)
    {
        if (stakers[_staker].amountOfColorsStaked == 0) {
            return 0;
        }
        uint256 multiplierForStaker;
        for (uint256 i; i < 4; i++) {
            if (stakers[_staker].amountOfColorsStaked >= rewardsThreshold[i]) {
                multiplierForStaker += 1;
            }
        }
        _rewards = (((
            ((block.timestamp - stakers[_staker].timeOfLastUpdate) *
                multiplierForStaker)
        ) * rewardsPerDay) / 86400);
    }

    ///////////
    // Owner //
    ///////////

    // Function for owner to withdraw tokens if too much is sent for
    // staking SC or tokens are not claimed.
    function withdrawPast(uint256 _amount) external onlyOwner {
        rewardsToken.safeTransfer(msg.sender, _amount);
    }
}

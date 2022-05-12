from brownie import StakingNFT, PastProject, ThePastNFT, accounts, chain
import brownie

# Checklist:
# 1. Rewards threshold - Done
# 2. Rewards accumulation - Done
# 3. Repeat for each threshold(3,5,7,11) - Done
# 4. Claim rewards
# 5. Withdraw


def test_main():
    owner = accounts[0]
    # Deploy mock for token
    token = PastProject.deploy(owner.address, {"from": owner})
    assert token.balanceOf(owner.address) == 1000000000000000000000
    # Pause fees for owner and staking SC
    token.excludeFromFee(owner.address, {"from": owner})
    # Deploy NFT Collection and mint all NFTs for owner
    nft = ThePastNFT.deploy({"from": owner})
    while nft.balanceOf(owner.address) < 3333:
        nft.safeMint(20, {"from": owner})
    # Deploy staking SC
    staking = StakingNFT.deploy(nft.address, token.address, {"from": owner})
    nft.setApprovalForAll(staking.address, True, {"from": owner})
    # Stake 3 colours
    staking.stake(1, 0, {"from": owner})
    user_info_1 = staking.userStakeInfo(owner.address)
    assert user_info_1[0] == 1 and user_info_1[1] == 0
    with brownie.reverts():
        staking.stake(10, 0, {"from": owner})
    with brownie.reverts():
        staking.stake(10, 2, {"from": owner})
    staking.stake(333, 1, {"from": owner})
    user_info_2 = staking.userStakeInfo(owner.address)
    assert user_info_2[0] == 2 and user_info_2[1] == 0
    staking.stake(700, 2, {"from": owner})
    chain.mine(blocks=10, timedelta=86400)
    # Assert rewards for 3 colours
    user_info_3 = staking.userStakeInfo(owner.address)
    assert user_info_3[0] == 3 and user_info_3[1] >= 161150
    # Stake 5 colours
    staking.stake(1003, 3, {"from": owner})
    staking.stake(1300, 4, {"from": owner})
    chain.mine(blocks=10, timedelta=86400)
    # Assert rewards for 5 colours
    user_info_4 = staking.userStakeInfo(owner.address)
    assert user_info_4[0] == 5 and user_info_4[1] >= user_info_3[1] + 161150 * 2
    print(user_info_4[1])
    # Stake 7 colours
    staking.stake(1600, 5, {"from": owner})
    staking.stake(1900, 6, {"from": owner})
    chain.mine(blocks=10, timedelta=86400)
    # Assert rewards for 7 colours
    user_info_5 = staking.userStakeInfo(owner.address)
    assert user_info_5[0] == 7 and user_info_5[1] >= user_info_4[1] + 161150 * 3
    print(user_info_5[1])
    # Stake 11 colours
    staking.stake(2200, 7, {"from": owner})
    staking.stake(2500, 8, {"from": owner})
    staking.stake(2800, 9, {"from": owner})
    staking.stake(3100, 10, {"from": owner})
    chain.mine(blocks=10, timedelta=86400)
    # Assert rewards for 11 colours
    user_info_6 = staking.userStakeInfo(owner.address)
    assert user_info_6[0] == 11 and user_info_6[1] >= user_info_5[1] + 161150 * 4
    print(user_info_6[1])
    assert staking.tokensStakedByUser(owner.address) == [
        1,
        333,
        700,
        1003,
        1300,
        1600,
        1900,
        2200,
        2500,
        2800,
        3100,
    ]
    # Send Past to Staking SC
    token.transfer(staking.address, 10000 * 10 ** 9, {"from": owner})
    # Exclude staking SC from fee
    token.excludeFromFee(staking.address, {"from": owner})
    # Assert withdraw rewards
    balance_before = token.balanceOf(owner.address)
    staking.claimRewards({"from": owner})
    balance_after = token.balanceOf(owner.address)
    assert balance_before <= balance_after - user_info_6[1]
    user_info_7 = staking.userStakeInfo(owner.address)
    assert user_info_7[0] == 11 and user_info_7[1] < 100
    # Assert withdraw NFTs
    staking.withdraw(1, 0, {"from": owner})
    user_info_6 = staking.userStakeInfo(owner.address)
    assert user_info_6[0] == 10
    assert nft.ownerOf(1) == owner.address

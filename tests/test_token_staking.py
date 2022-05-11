from brownie import StakingToken, PastProject, ThePastNFT, accounts, chain

# Checklist:
# 1. Deposits: Done
# 2. Rewards accumulation: Done
# 3. Claiming rewards: Done
# 4. Withdraw: Done
# 5. Withdraw all: Done


def test_main():
    owner = accounts[0]
    # Deploy mock for token
    token = PastProject.deploy(owner.address, {"from": owner})
    assert token.balanceOf(owner.address) == 1000000000000000000000
    # Pause fees for owner and staking SC
    token.excludeFromFee(owner.address, {"from": owner})
    # Deploy NFT Collection and mint 10 NFTs for owner
    nft = ThePastNFT.deploy({"from": owner})
    # Deploy Staking Smart Contract
    staking = StakingToken.deploy(token.address, nft.address, {"from": owner})
    # Fund Staking Smart Contract
    token.transfer(staking.address, 10000 * 10 ** 9, {"from": owner})
    # Exclude staking SC from fee
    token.excludeFromFee(staking.address, {"from": owner})
    # Approve token transfer for stkaing
    token.approve(staking.address, 100 * 10 ** 9, {"from": owner})
    # Stake
    staking.deposit(100 * 10 ** 9, {"from": owner})
    # Assert deposit
    deposit_info_1 = staking.getDepositInfo(owner.address)
    print(deposit_info_1[1])
    assert deposit_info_1[0] == 100 * 10 ** 9
    # Assert all tokens arrived in the Stkaing SC
    assert token.balanceOf(staking.address) == 100 * 10 ** 9 + 10000 * 10 ** 9
    # Forward in time 3 days
    chain.mine(blocks=100, timedelta=86400 * 3)
    # Assert rewards accumulation
    deposit_info_2 = staking.getDepositInfo(owner.address, {"from": owner})
    assert deposit_info_2[1] == int(100 * 10 ** 9 * 0.05904 / 100) * 3
    assert deposit_info_2[0] == 100 * 10 ** 9
    # Claim rewards
    balance_before = token.balanceOf(owner.address)
    staking.claimRewards({"from": owner})
    balance_after = token.balanceOf(owner.address)
    assert balance_before + deposit_info_2[1] == balance_after
    # Withdraw
    balance_before = token.balanceOf(owner.address)
    staking.withdraw(10 * 10 ** 9, {"from": owner})
    balance_after = token.balanceOf(owner.address)
    assert balance_before + 10 * 10 ** 9 == balance_after
    deposit_info_3 = staking.getDepositInfo(owner.address, {"from": owner})
    assert deposit_info_3[0] == 90 * 10 ** 9
    # Forward in time
    chain.mine(blocks=100, timedelta=86400 * 3)
    # Assert rewards accumulation
    deposit_info_4 = staking.getDepositInfo(owner.address, {"from": owner})
    assert (
        deposit_info_4[1] == int(90 * 10 ** 9 * 0.05904 / 100) * 3 + deposit_info_3[1]
    )
    # Assert withdraw all
    balance_before = token.balanceOf(owner.address)
    staking.withdrawAll({"from": owner})
    balance_after = token.balanceOf(owner.address)
    assert (
        balance_before + deposit_info_4[0] + deposit_info_4[1] == balance_after
    )  # 615 = rewards accumulated in the block of the last tx

from brownie import StakingToken, PastProject, ThePastNFT, accounts, config


def test_main():
    owner = accounts.add(config["wallets"]["from_key"])
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

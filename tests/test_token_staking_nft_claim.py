from brownie import StakingToken, PastProject, ThePastNFT, accounts, chain


def test_main():
    owner = accounts[0]
    # Deploy mock for token
    token = PastProject.deploy(owner.address, {"from": owner})
    assert token.balanceOf(owner.address) == 1000000000000000000000
    # Pause fees for owner
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
    token.approve(staking.address, 1000000000 * 10 ** 9, {"from": owner})
    # Stake
    staking.deposit(1000000000 * 10 ** 9, {"from": owner})
    # Forward in time 30 days
    chain.mine(blocks=100, timedelta=2592100)
    # Assert can claim
    assert staking.hasOneBillionStaked(owner.address) == True
    # Deposit reward NFTs in the SC
    nft.setApprovalForAll(staking.address, True, {"from": owner})
    staking.depositNftRewards([1, 2, 3], {"from": owner})
    assert nft.ownerOf(3) == staking.address
    # Assert claim NFT rewards
    staking.claimNftReward({"from": owner})
    assert nft.ownerOf(3) == owner.address
    assert staking.hasOneBillionStaked(owner.address) == False
    # Forward in time 30 days
    chain.mine(blocks=100, timedelta=2592100)
    # Assert claim NFT rewards
    assert nft.ownerOf(2) == staking.address
    staking.claimNftReward({"from": owner})
    assert nft.ownerOf(2) == owner.address
    assert staking.hasOneBillionStaked(owner.address) == False

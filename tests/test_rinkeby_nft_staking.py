from brownie import StakingNFT, PastProject, ThePastNFT, accounts, config
import brownie


def test_main():
    owner = accounts.add(config["wallets"]["from_key"])
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
    staking.stake(333, 1, {"from": owner})
    user_info_2 = staking.userStakeInfo(owner.address)
    assert user_info_2[0] == 2 and user_info_2[1] == 0
    staking.stake(700, 2, {"from": owner})

from brownie import (
    accounts,
    config,
    StakingNFT,
    GemsCollection,
    PastProject,
    StakingToken,
)


def main():
    # account = accounts.add(config["wallets"]["from_key"])
    account = accounts[0]
    # Deploy Smart Contracts
    token = PastProject.deploy(account.address, {"from": account}, publish_source=False)
    nft = GemsCollection.deploy({"from": account}, publish_source=False)
    token_staking = StakingToken.deploy(
        token.address, nft.address, {"from": account}, publish_source=False
    )
    nft_staking = StakingNFT.deploy(
        nft.address, token.address, {"from": account}, publish_source=False
    )
    # Set up
    token.excludeFromFee(token_staking.address, {"from": account})
    token.excludeFromFee(nft_staking.address, {"from": account})
    address = "0xBD908E3FCFAE71412E20E7727C579A8143967F0F"
    address = accounts[1].address
    # token.transfer(address, 5000000000 * 10 ** 9, {"from": account})
    # print(nft.owner())
    for i in [
        [1, 2, 3],
        [303, 304, 305],
        [606, 607, 608],
        [909, 910, 911],
        [1212, 1213, 1214],
        [1515, 1516, 1517],
        [1818, 1819, 1820],
        [2121, 2122, 2123],
        [2424, 2425, 2426],
        [2727, 2728, 2729],
        [3030, 3031, 3032],
    ]:
        nft.mintForAddress(i, [address, address, address], {"from": account})

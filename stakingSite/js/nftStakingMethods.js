
async function nftStake(walletAddress, tokenId, gas){
    if( nftStakingContract != null) {
        try {
            let result = await nftStakingContract.methods.stake(tokenId, getColor(tokenId)).send({from: walletAddress, gas: gas});
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The NFT Staking Contract is null.");
    }
}

async function nftClaimRewards(walletAddress, gas){
    if( nftStakingContract != null) {
        try {
            let result = await nftStakingContract.methods.claimRewards().send({from: walletAddress, gas: gas});
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The NFT Staking Contract is null.");
    }
}

async function nftStakeMultiple(walletAddress, tokenIds, colors, gas){
    if( nftStakingContract != null) {
        try {
            nftStakingContract.methods.stakeMultiple(tokenIds, colors).send({from: walletAddress, gas: gas});
            return null;
        } catch (error) {
            console.log(error);
            return {error: error};
        }
    } else {
        console.log("The NFT Staking Contract is null.");
    }
}



async function nftUnStake(walletAddress, tokenId, gas){
    if( nftStakingContract != null) {
        try {
            let result = nftStakingContract.methods.withdraw(tokenId, getColor(tokenId)).send({from: walletAddress, gas: gas});
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The NFT Staking Contract is null.");
    }
}

async function nftUnStakeMultiple(walletAddress, tokenIds, colors, gas){
    if( nftStakingContract != null) {
        try {
            nftStakingContract.methods.withdrawMultiple(tokenIds, colors).send({from: walletAddress, gas: gas});
            return null;
        } catch (error) {
            console.log(error);
            return {error: error};
        }
    } else {
        console.log("The NFT Staking Contract is null.");
    }
}

async function nftUserStakeInfo(walletAddress) {
    if( nftStakingContract != null) {
        try {
            let result = await nftStakingContract.methods.userStakeInfo(walletAddress).call({from: walletAddress});
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The NFT Staking Contract is null.");
    }
}

async function nftTokensStakedByUser(walletAddress) {
    if( nftStakingContract != null) {
        try {
            let result = await nftStakingContract.methods.tokensStakedByUser(walletAddress).call({from: walletAddress});
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The NFT Staking Contract is null.");
    }
}

function getColor(tokenId) {
    let baseRange = 303;
    if (tokenId <= (1 * baseRange)) return 0;
    if (tokenId <= (2 * baseRange)) return 1;
    if (tokenId <= (3 * baseRange)) return 2;
    if (tokenId <= (4 * baseRange)) return 3;
    if (tokenId <= (5 * baseRange)) return 4;
    if (tokenId <= (6 * baseRange)) return 5;
    if (tokenId <= (7 * baseRange)) return 6;
    if (tokenId <= (8 * baseRange)) return 7;
    if (tokenId <= (9 * baseRange)) return 8;
    if (tokenId <= (10 * baseRange)) return 9;
    if (tokenId <= (11 * baseRange)) return 10;
}



let gemList = new Map();

function Nft(id, color, name) {
    this.id = id;
    this.color = color;
    this.name = name;
    this.image = getTokenImage(this.id);
    this.isStaked = false;
    this.isSelected = false;
    this.canBeSelected = true;
    this.isPending = false;
}

function getTokenImage(tokenId) {
    return "./img/gems/" + (Math.floor((tokenId-1) / 303) + 1) + ".jpg";
}

async function nftApprove(walletAddress, tokenId, gas){
    if( nftContract != null) {
        try {
            let result = await nftContract.methods.approve(NFT_STAKING_CONTRACT_ADDRESS, tokenId).send({from: walletAddress, gas: gas});
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function nftIsApprovedForAll(walletAddress){
    if( nftContract != null) {
        try {
            let result = await nftContract.methods.isApprovedForAll(walletAddress, NFT_STAKING_CONTRACT_ADDRESS).call({from: walletAddress});
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}


async function nftSetApprovalForAll(walletAddress, gas){
    if( nftContract != null) {
        try {
            let result = await nftContract.methods.setApprovalForAll(NFT_STAKING_CONTRACT_ADDRESS, true).send({from: walletAddress, gas: gas});
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function nftBalanceOf(walletAddress) {
    if( nftContract != null) {
        try {
            let result = await nftContract.methods.balanceOf(walletAddress).call({from: walletAddress});
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Contract is null.");
    }
}

async function nftTokenOfOwnerByIndex(walletAddress, tokenIndex) {
    if( nftContract != null) {
        try {
            let result = await nftContract.methods.tokenOfOwnerByIndex(walletAddress, tokenIndex).call({from: walletAddress});
            return await result;
        } catch (error) {
            if(error.originalError.code === 3) {
                console.log("Cannot access token owner list as tokens are being updated.");
            } else {
                console.log(error);
            }

        }
    } else {
        console.log("The Token Contract is null.");
    }
}

async function nftTokenURI(walletAddress, tokenId) {
    if( nftContract != null) {
        try {
            let result = await nftContract.methods.tokenURI(tokenId).call({from: walletAddress});
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Contract is null.");
    }
}


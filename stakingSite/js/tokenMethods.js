
async function getTokenDecimals() {
    if( tokenContract != null) {
        let result = await tokenContract.methods.decimals().call();
        try {
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Contract is null.");
    }
}

async function getTokenSymbol() {
    if( tokenContract != null) {
        let result = await tokenContract.methods.symbol().call();
        try {
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Contract is null.");
    }
}

async function getTokenName() {
    if( tokenContract != null) {
        let result = await tokenContract.methods.name().call();
        try {
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Contract is null.");
    }
}

async function getPastBalance(walletAddress) {
    if( tokenContract != null) {
        let result = await tokenContract.methods.balanceOf(walletAddress).call({from: walletAddress});
        try {
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Contract is null.");
    }
}

async function tokenStakingApprove(walletAddress, amount, gas){
    if( tokenContract != null) {
        let result = await tokenContract.methods.approve(TOKEN_STAKING_CONTRACT_ADDRESS, amount).send({from: walletAddress,gas:gas});
        try {
            return await result;
        } catch (error) {
            console.log("Approval error: " + error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}


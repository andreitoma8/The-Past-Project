
async function tokenStakingDeposit(walletAddress, amount, gas){
    if( tokenStakingContract != null) {
        console.log("Depositing " + amount);
        let result = await tokenStakingContract.methods.deposit(amount).send({from: walletAddress, gas:gas});
        try {
            console.log(`Result: ${result}`);
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function stakeRewards(walletAddress, gas){
    if( tokenStakingContract != null) {
        let result = await tokenStakingContract.methods.stakeRewards().send({from: walletAddress, gas:gas});
        try {
            console.log(`Result: ${result}`);
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function claimRewards(walletAddress, gas){
    if( tokenStakingContract != null) {
        let result = await tokenStakingContract.methods.claimRewards().send({from: walletAddress, gas:gas});
        try {
            console.log(`Result: ${result}`);
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function claimNFTReward(walletAddress, gas){
    if( tokenStakingContract != null) {
        let result = await tokenStakingContract.methods.claimNftReward().call({from: walletAddress, gas:gas});
        try {
            return await result;
        } catch (error) {
            console.log(error.message);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function withdraw(walletAddress, amount, gas){
    if( tokenStakingContract != null) {
        let result = await tokenStakingContract.methods.withdraw(amount).send({from: walletAddress, gas});
        try {
            console.log(`Result: ${result}`);
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function withdrawAll(walletAddress, gas){
    if( tokenStakingContract != null) {
        let result = await tokenStakingContract.methods.withdrawAll().send({from: walletAddress, gas:gas});
        try {
            console.log(`Result: ${result}`);
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function getTokenStakingDepositInfo(walletAddress){
    if( tokenStakingContract != null) {
        let result = await tokenStakingContract.methods.getDepositInfo(walletAddress).call({from: walletAddress});
        try {
            return result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function getHasOneBillionStaked(walletAddress){
    if( tokenStakingContract != null) {
        let result = await tokenStakingContract.methods.hasOneBillionStaked(walletAddress).call({from: walletAddress});
        try {
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}

async function compoundRewardsTimer(walletAddress){
    if( tokenStakingContract != null) {
        let result = await tokenStakingContract.methods.compoundRewardsTimer(walletAddress).call({from: walletAddress});
        try {
            return await result;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("The Token Staking Contract is null.");
    }
}





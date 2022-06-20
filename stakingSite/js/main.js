/* Mock data */
const averageCost = "N/A";
const paidFees = 0.00;
const profitLoss = "N/A";
const tokenAPR = 21.56;
let usdPrice = 2000.00;
let pastPrice = 0.0;


let activeNetwork = "Ethereum network";

/* Static strings */
const strWalletConnect = "CONNECT WALLET";
const strWalletConnected = "WALLET CONNECTED";
const strCurrentGasMessage = "ESTIMATED GAS";
const strWalletNotConnected = "ERROR: There has been an issue whilst connecting your wallet. Please try again.";
const strNoPASTContractFound = "No $PAST contract found. Are you connected to the correct network?";
const strNoPASTTokensFound = "No $PAST Tokens found in your wallet. Are you using the correct wallet?";
const strNoWeb3InBrowser = "ERROR: You do not appear to have a Web3 compatible wallet installed. Try MetaMask!";
const strContinueCancelButtons = "<div class='btnCancel dashboardButton' onClick='cancelButtonClick(this)'>Cancel</div><div id='btnContinueAnyway' class='dashboardButton' onClick='continueAnyway(this)'>Continue</div>";
const strTokenStakeHeading = "STAKE $PAST TOKENS";
const strGemStakeHeading = "STAKE GEMS OF THE PAST";
const strInfoBoxStaked = "Total Staked";
const strInfoBoxEarned = "$PAST Earned";
const strGemHasAlreadyBeenStaked = "This gem color has already been staked";
const htmlFunctionWorkAreaCancelButtonText = "Cancel";
const htmlFunctionWorkAreaApproveButtonText = "Approve";
let erc20Symbol = "";
let erc20Name = "";
let erc20Decimals = 9;

/* DOM elements */
const walletNotConnectedEl = document.getElementById("walletNotConnected");
const walletConnectOverlayEl = document.getElementById("walletConnectOverlay");

const walletConnectEl = document.getElementById("walletConnect");
const currentGasEl = document.getElementById("currentGas");
const stakedTokensEl = document.getElementById("stakedTokens");

const tokenTab = document.getElementById("tokenTab");
const tokensInfo = stakedTokensEl.querySelector(".infoPopup");
const tokenInfoDetail = document.getElementById("tokensInfoDetail");
const stakedTokensDetail  = document.getElementById("stakedTokensDetail");
const tokenFunctionWorkArea = document.getElementById("tokenFunctionWorkArea");

const gemTab = document.getElementById("gemTab");
const stakedGemsEl = document.getElementById("stakedGems");
const gemsInfo = stakedGemsEl.querySelector(".infoPopup");
const gemInfoDetail = document.getElementById("gemsInfoDetail");
const stakedGemsDetail = document.getElementById("stakedGemsItems");
const gemFunctionWorkArea = document.getElementById("gemFunctionWorkArea");
const tokensTotalStakedEl = document.getElementById("tokensTotalStaked");
const tokensPastEarnedEl = document.getElementById("tokensPastEarned");
const gemsTotalStakedEl = document.getElementById("gemsTotalStaked");
const gemsPastEarnedEl = document.getElementById("gemsPastEarned");

/* General VARS */
let walletConnected = false;
let currentGas = 0;
let suggestedFeeMultiplier = 1.75; // Add 75% to gas for faster transaction
let suggestedFee = 0;
let accountAddress = null;
let ethUSD = 0.0;
let walletBalanceETH = 0.0;
let walletBalancePAST = 0.0;
let walletStakedPAST = 0.0;
let walletRewardsPAST = 0.0;
let stakingCooldownTimer = 0;
let claimRewardsTimer = 0;
let hasOneBillionStaked = false;
let pastValueUSD = 0.0;
let equityStakedPerc = 0.0;
let pastPayable = 0;
let return24h = 0.0;
let gemsSelected = [];
let previousNumberNFTsStaked = 0;
let gemsStakeInfo = [];
let stakedColors = [];
let theCountDownTimer = 0;
let nftsUpdated = false;
let continueWithoutPAST = false;

//const listOfNfts = [][];

let ethUsdExchange =
  {
    nativePrice: {
      value: null,
      decimals: 18,
      name: "Ether",
      symbol: "ETH"
  },
   usdPrice: 8.291304863e-8,
   exchangeAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
   exchangeName: "Uniswap v2"
  }

async function initMain() {
  try {
    ethUsdExchange = await fetch("https://deep-index.moralis.io/api/v2/erc20/0x8a83a0de55c003a970070a8a0fa7cb24203fc13d/price?chain=eth", {
      headers: {
        'accept': 'application/json',
        'X-API-Key': '3IXR7oTLnbKWXaFxUqkpii2dd8ZkUorpLKBJoxSm7okt5LSH3XQW5tSCRyrelOzK'
      }
    }).then(response => {
      return response.text();
    }).catch(error => {
      console.log(error);
    });
  } catch (error) {
    console.log(error);
  }
  ethUSD = JSON.parse(ethUsdExchange).usdPrice;

  let exchangeTimer = setInterval(async function(){
    try {
      ethUsdExchange = await fetch("https://rest.coinapi.io/v1/exchangerate/ETH/USD ", {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          credentials: 'omit',
          'Content-Type': 'application/json',
          'X-CoinAPI-Key': '1FE5C666-674A-4E79-B6AB-205E360B32A5',
          'Accept': 'application/json'
        }
      }).then(response => {
        return response.text();
      }).catch(error => {
        console.log(error);
      });
    } catch (error) {
      console.log(error);
    }
    ethUSD = JSON.parse(ethUsdExchange).usdPrice;
  },900000);

  if (isNaN(ethUSD)) ethUSD = 1000;

  stakedTokensEl.querySelector(".stakeHeadingHeader").innerHTML = strTokenStakeHeading;
  stakedTokensEl.querySelector(".infoboxLeft").querySelector(".infoboxHeader").innerHTML = strInfoBoxStaked;
  stakedTokensEl.querySelector(".infoboxRight").querySelector(".infoboxHeader").innerHTML = strInfoBoxEarned;

  stakedGemsEl.querySelector(".stakeHeadingHeader").innerHTML = strGemStakeHeading;
  stakedGemsEl.querySelector(".infoboxLeft").querySelector(".infoboxHeader").innerHTML = strInfoBoxStaked;
  stakedGemsEl.querySelector(".infoboxRight").querySelector(".infoboxHeader").innerHTML = strInfoBoxEarned;

  stakedGemsDetail.innerHTML = "<div class='nftLoading'>Coming soon... please check back regularly...</div>";

  walletConnectEl.innerHTML = strWalletConnect;
  walletNotConnectedEl.innerHTML = strWalletNotConnected;

  walletConnected = false;

  /* add the work area content wrappers */
  makeDiv(tokenFunctionWorkArea, "tokenWorkAreaContentWrapper", "workAreaContentWrapper");
  makeDiv(gemFunctionWorkArea, "gemWorkAreaContentWrapper", "workAreaContentWrapper");

  /* add the work area approve buttons */
  addWorkAreaApproveButton(tokenFunctionWorkArea);
  addWorkAreaApproveButton(gemFunctionWorkArea);

  /* add the work area cancel buttons */
  addWorkAreaCancelButton(tokenFunctionWorkArea);
  addWorkAreaCancelButton(gemFunctionWorkArea);

  document.title = erc20Name + " Dashboard";
}

tokenTab.addEventListener("click", function() {
  this.classList.add("selected");
  gemTab.classList.remove("selected");
  hide(stakedGemsEl);
  show(stakedTokensEl);
});

gemTab.addEventListener("click", function() {
  this.classList.add("selected");
  tokenTab.classList.remove("selected");
  hide(stakedTokensEl);
  show(stakedGemsEl);
  show(stakedGemsDetail);
});

tokenInfoDetail.addEventListener("click", function(){
  hide(this);
})

tokensInfo.addEventListener("click", function() {
  show(tokenInfoDetail);
});

gemInfoDetail.addEventListener("click", function() {
  hide(this);
})

gemsInfo.addEventListener("click", function() {

  gemList.forEach(function(theNft,theId) {
  });
  show(gemInfoDetail);
  gemInfoDetail.style.height = (stakedGemsDetail.offsetHeight - 42) + "px";
  console.log(gemInfoDetail.style.height + " : " + stakedGemsDetail.offsetHeight);

});

function getQuickAmountButtons() {
  return "<div class='quickAmounts'><div class='quickPerc dashboardButton' withdrawperc='25'>25%</div><div class='quickPerc dashboardButton' withdrawperc='50'>50%</div><div class='quickPerc dashboardButton' withdrawperc='75'>75%</div><div class='quickPerc dashboardButton' withdrawperc='100'>ALL</div>";
}

function showTokenStakingWindow() {
  clearInterval(theCountDownTimer);
  walletConnectOverlayEl.classList.remove("connected");
  walletConnectOverlayEl.style.zIndex = 60;
  tokenFunctionWorkArea.setAttribute("workArea","tokenStaking");
  tokenFunctionWorkArea.style.minHeight = "300px";
  tokenFunctionWorkArea.style.height = "300px";
  show(tokenFunctionWorkArea);
  let theStakingMessage = "<label>Enter amount of $PAST tokens you wish to stake: </label><input type='tel' id='tokenStakingNumbers' />";
  theStakingMessage += "<div class='showMaxAmount'>max: " + cryptoFormat("", walletBalancePAST, false, 9) + "</div>";
  theStakingMessage += getQuickAmountButtons();
  tokenFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = theStakingMessage;
  tokenFunctionWorkArea.querySelectorAll(".quickPerc").forEach(qp => {
    qp.addEventListener("click", function() {
      getQuickPercAmount(qp, "tokenStakingNumbers", walletBalancePAST)
    });
  });

  // Set the filter to numbers only, and no greater the wallBalancePAST value
  setInputFilter(document.getElementById("tokenStakingNumbers"), function(value) {
    return /^\d*\.?\d*$/.test(value);
  }, walletBalancePAST);
}

async function showTokenCompoundWindow() {
  clearInterval(theCountDownTimer);
  walletConnectOverlayEl.classList.remove("connected");
  walletConnectOverlayEl.style.zIndex = 60;
  tokenFunctionWorkArea.setAttribute("workArea","tokenCompound");
  tokenFunctionWorkArea.style.minHeight = "350px";
  tokenFunctionWorkArea.style.height = "350px";
  show(tokenFunctionWorkArea);
  tokenFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = "";
  claimRewardsTimer = await compoundRewardsTimer(accountAddress).then(t => {return t;});

  let theCompoundMessage = "<label>You have <strong>" + cryptoFormat(" " + erc20Symbol, walletRewardsPAST,false, 9) + "</strong> to add to your stake.<br/><br/>";
  if (claimRewardsTimer > 0) {
    theCompoundMessage += "However, you can only claim this in " + toHHMMSS(claimRewardsTimer > 0 ? claimRewardsTimer-- : 0) + ".</label>";
  } else {
    theCompoundMessage += "Claim now?</label>";
  }
  tokenFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = theCompoundMessage;

  theCountDownTimer = setInterval(function(){
    let theCompoundMessage = "<label>You have <strong>" + cryptoFormat(" " + erc20Symbol, walletRewardsPAST,false, 9) + "</strong> to add to your stake.<br/><br/>";
    if (claimRewardsTimer > 0) {
      theCompoundMessage += "However, you can only claim this in " + toHHMMSS(claimRewardsTimer > 0 ? claimRewardsTimer-- : 0) + ".</label>";
    } else {
      theCompoundMessage += "Claim now?</label>";
    }
    tokenFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = theCompoundMessage;
  }, 1000);
}

function showTokenClaimWindow() {
  clearInterval(theCountDownTimer);
  walletConnectOverlayEl.classList.remove("connected");
  walletConnectOverlayEl.style.zIndex = 60;
  tokenFunctionWorkArea.setAttribute("workArea","tokenClaim");
  tokenFunctionWorkArea.style.minHeight = "300px";
  tokenFunctionWorkArea.style.height = "300px";
  show(tokenFunctionWorkArea);
  tokenFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = "";
  let theClaimMessage = "<label>You have <strong>" + cryptoFormat(" " + erc20Symbol, walletRewardsPAST,false, 9) + "</strong> to claim. <br/><br/>Claim now?</label>";
  tokenFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = theClaimMessage;
}

function showTokenWithdrawWindow() {
  clearInterval(theCountDownTimer);
  walletConnectOverlayEl.classList.remove("connected");
  walletConnectOverlayEl.style.zIndex = 60;
  tokenFunctionWorkArea.setAttribute("workArea","tokenWithdraw");
  tokenFunctionWorkArea.style.minHeight = "300px";
  tokenFunctionWorkArea.style.height = "300px";
  show(tokenFunctionWorkArea);
  let theWithdrawalMessage = "<label>Enter amount of $PAST tokens you wish to withdraw: </label><input type='tel' id='tokenWithdrawalNumbers' />";
  theWithdrawalMessage += getQuickAmountButtons();
  tokenFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = theWithdrawalMessage;
  tokenFunctionWorkArea.querySelectorAll(".quickPerc").forEach(qp => {
    qp.addEventListener("click", function() {
      getQuickPercAmount(qp, "tokenWithdrawalNumbers", walletStakedPAST)
    });
  });
  // Set the filter to numbers only, and no greater the wallStakedPAST value
  setInputFilter(document.getElementById("tokenWithdrawalNumbers"), function(value) {
    return /^\d*\.?\d*$/.test(value);
  }, walletStakedPAST);
}

function getQuickPercAmount (parent, target, whichBalance) {
  // get 100% of staked $PAST - doing some trickery to round up to the 9th decimal (rather than the 8th decimal)
  let quickPerc = new BigNumber(parseInt(parseInt(parent.getAttribute("withdrawperc"))) / 100 * whichBalance - Math.pow(10, -(erc20Decimals+1))).toFixed(erc20Decimals);
  document.getElementById(target).value = parseFloat(quickPerc);
}
function unbindTokenButtons() {
  disableBtn("btnTokenStake", showTokenStakingWindow);
  disableBtn("btnTokenCompound", showTokenCompoundWindow);
  disableBtn("btnTokenClaim", showTokenClaimWindow);
  disableBtn("btnTokenWithdraw", showTokenWithdrawWindow);
}

function showGemStakingWindow() {
  gemFunctionWorkArea.setAttribute("workArea","gemStake");
  walletConnectOverlayEl.classList.remove("connected");
  walletConnectOverlayEl.style.zIndex = 60;
  gemFunctionWorkArea.style.minHeight = "300px";
  gemFunctionWorkArea.style.height = "300px";
  show(gemFunctionWorkArea);
  let theStakingMessage = "<div class='approvalTitle'>";
  theStakingMessage += "You are about to stake " + gemsSelected.length + " nft" + (gemsSelected.length > 1 ? "s" : "") + ":";
  theStakingMessage += "</div>";
  gemsSelected.forEach((id, index) => {
    theStakingMessage += "<div class='nftStakingItemDetail' style='background: url(" + getTokenImage(id) + ");background-size: 200%;background-position: 50% 25%;'>#" + id + "</div>";
  })
  theStakingMessage += "<div class='approvalFooter'>You will need to approve this transaction in your wallet.</div>";
  gemFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = theStakingMessage;
}

function showGemUnstakingWindow() {
  gemFunctionWorkArea.setAttribute("workArea","gemUnstake");
  walletConnectOverlayEl.classList.remove("connected");
  walletConnectOverlayEl.style.zIndex = 60;
  gemFunctionWorkArea.style.minHeight = "300px";
  gemFunctionWorkArea.style.height = "300px";
  show(gemFunctionWorkArea);
  let theUnStakingMessage = "<div class='approvalTitle'>";

  if (gemsSelected.length > 0) {
    theUnStakingMessage += "You are about to unstake " + gemsSelected.length + " nfts:";
    theUnStakingMessage += "</div>";
    gemsSelected.forEach((id, index) => {
      theUnStakingMessage += "<div class='nftStakingItemDetail' style='background: url(" + getTokenImage(id) + ");background-size: 200%;background-position: 50% 25%;'>#" + id + "</div>";
    });
    theUnStakingMessage += "<div class='approvalFooter'>You will need to approve this transaction in your wallet.</div>";
  }
  gemFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = theUnStakingMessage;
}

function showGemClaimWindow() {
  gemFunctionWorkArea.setAttribute("workArea","gemClaim");
  walletConnectOverlayEl.classList.remove("connected");
  walletConnectOverlayEl.style.zIndex = 60;
  gemFunctionWorkArea.style.minHeight = "300px";
  gemFunctionWorkArea.style.height = "300px";
  show(gemFunctionWorkArea);
  let theNftClaimMessage = "<label>You currently have <strong>" + cryptoFormat(" $PAST", parseInt(gemsStakeInfo[1] / Math.pow(10, erc20Decimals)), false, 18) + "</strong> to claim. <br/><br/>Claim now?</label>";
  gemFunctionWorkArea.querySelector(".workAreaContentWrapper").innerHTML = theNftClaimMessage;

}

function bindGemButtons() {
  enableBtn("btnNftStake", showGemStakingWindow);
  enableBtn("btnNftUnstake", showGemUnstakingWindow);
  enableBtn("btnNftClaim", showGemClaimWindow);
}

function unbindGemButtons() {
  disableBtn("btnNftStake", showGemStakingWindow);
  disableBtn("btnNftUnstake", showGemUnstakingWindow);
  disableBtn("btnNftClaim", showGemClaimWindow);
}

function disableBtn(btnId, theFunction) {
  let theButton = document.getElementById(btnId);
  theButton.classList.add("disabled");
  theButton.removeEventListener("click", theFunction);
}

function enableBtn(btnId, theFunction) {
  let theButton = document.getElementById(btnId);
  theButton.classList.remove("disabled");
  theButton.addEventListener("click", theFunction);
}

function closeTokenActionStatus(el) {
  show(document.getElementById("tokenFunctionWorkAreaApproveBtn"));
  show(document.getElementById("tokenFunctionWorkAreaCancelBtn"));
  hide(tokenFunctionWorkArea);
  el.parentElement.remove();
  walletConnectOverlayEl.style.zIndex = 0;
  walletConnectOverlayEl.classList.add("connected");
}

function addWorkAreaApproveButton(workArea) {

  let btn = makeDiv(workArea, workArea.id + "ApproveBtn", "workAreaButton", htmlFunctionWorkAreaApproveButtonText);
  workArea.querySelector("#" + workArea.id + "ApproveBtn").classList.add("approve");
  workArea.querySelector("#" + workArea.id + "ApproveBtn").addEventListener("click", async function () {

    switch(workArea.id) {
      case "tokenFunctionWorkArea" :
        // Add any other countdown timers here in order to clear them :-);
        switch(tokenFunctionWorkArea.getAttribute("workArea")){
          case "tokenStaking" :
            let inputElValue = new BigNumber(document.getElementById("tokenStakingNumbers").value);
            // Don't forget, the max value is restrained to the wallet balance of
            // $PAST tokens in the input filter function
              if (inputElValue > walletBalancePAST) {
                let tokenActionStatus = document.getElementById("tokenActionStatus");
                tokenActionStatus.innerHTML = "You cannot stake more $PAST than you have. The max amount you can stake is <br>" + formatTokensForHeroDisplay(walletBalancePAST) + "<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
                tokenActionStatus.classList.remove("tokenActionPending");
                tokenActionStatus.classList.add("tokenActionFailed");
              } else {
                let precisionValue = inputElValue.shiftedBy(erc20Decimals).toString();
                //TODO: Show the pending stake box here
                /* add the pending, success, and failure layers */
                makeDiv(document.getElementById("tokenWorkAreaContentWrapper"), "tokenActionStatus", "pending");
                let tokenActionStatus = document.getElementById("tokenActionStatus");
                tokenActionStatus.innerHTML = "STAKE PENDING";
                tokenActionStatus.classList.add("tokenActionPending");
                hide(document.getElementById("tokenFunctionWorkAreaApproveBtn"));
                hide(document.getElementById("tokenFunctionWorkAreaCancelBtn"));
                await tokenStakingApprove(accountAddress, precisionValue, suggestedFee).then(
                    await tokenStakingDeposit(accountAddress, precisionValue, suggestedFee).then(() => {

                      tokenActionStatus.innerHTML = "STAKING SUCCESSFUL<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
                      tokenActionStatus.classList.remove("tokenActionPending");
                      tokenActionStatus.classList.add("tokenActionSuccess");
                      walletConnectOverlayEl.style.zIndex = 0;
                      getERC20Info().then(() => {
                        updateTokenValues()
                      });
                    }).catch(error => {
                      if (error.code === -32603) {
                        tokenActionStatus.innerHTML = "Amount staked is less than the minimum amount.<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
                      } else {
                        tokenActionStatus.innerHTML = error.message + "<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
                      }
                      tokenActionStatus.classList.remove("tokenActionPending");
                      tokenActionStatus.classList.add("tokenActionFailed");
                      walletConnectOverlayEl.style.zIndex = 0;
                    })
                );
              }

            break;
          case "tokenCompound" :
            makeDiv(document.getElementById("tokenWorkAreaContentWrapper"), "tokenActionStatus", "pending");
            let tokenActionStatusCompound = document.getElementById("tokenActionStatus");
            tokenActionStatusCompound.innerHTML = "COMPOUND PENDING";
            tokenActionStatusCompound.classList.add("tokenActionPending");
            hide(document.getElementById("tokenFunctionWorkAreaApproveBtn"));
            hide(document.getElementById("tokenFunctionWorkAreaCancelBtn"));
            await stakeRewards(accountAddress, suggestedFee).then(() => {
              tokenActionStatusCompound.innerHTML = "COMPOUND SUCCESSFUL<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
              tokenActionStatusCompound.classList.remove("tokenActionPending");
              tokenActionStatusCompound.classList.add("tokenActionSuccess");
              walletConnectOverlayEl.style.zIndex = 0;
              getERC20Info().then(() => {
                  updateTokenValues()
              });
              }
            ).catch(error => {
              tokenActionStatusCompound.innerHTML = error.message + "<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
              tokenActionStatusCompound.classList.remove("tokenActionPending");
              tokenActionStatusCompound.classList.add("tokenActionFailed");
            });
            break;
          case "tokenClaim" :
            /* add the pending, success, and failure layers */
            makeDiv(document.getElementById("tokenWorkAreaContentWrapper"), "tokenActionStatus", "pending");
            let tokenActionStatusClaim = document.getElementById("tokenActionStatus");
            tokenActionStatusClaim.innerHTML = "CLAIM PENDING";
            tokenActionStatusClaim.classList.add("tokenActionPending");
            hide(document.getElementById("tokenFunctionWorkAreaApproveBtn"));
            hide(document.getElementById("tokenFunctionWorkAreaCancelBtn"));
            await claimRewards(accountAddress, suggestedFee).then(() => {
              tokenActionStatusClaim.innerHTML = "CLAIM SUCCESSFUL<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
              tokenActionStatusClaim.classList.remove("tokenActionPending");
              tokenActionStatusClaim.classList.add("tokenActionSuccess");
              walletConnectOverlayEl.style.zIndex = 0;
              getERC20Info().then(() => {
                updateTokenValues()
              });
            }).catch(error => {
              tokenActionStatusClaim.innerHTML = error.message + "<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
              tokenActionStatusClaim.classList.remove("tokenActionPending");
              tokenActionStatusClaim.classList.add("tokenActionFailed");
            });
            break;
          case "tokenWithdraw" :
            /* add the pending, success, and failure layers */
            makeDiv(document.getElementById("tokenWorkAreaContentWrapper"), "tokenActionStatus", "pending");
            let tokenActionStatus = document.getElementById("tokenActionStatus");
            tokenActionStatus.innerHTML = "WITHDRAWAL PENDING";
            tokenActionStatus.classList.add("tokenActionPending");
            hide(document.getElementById("tokenFunctionWorkAreaApproveBtn"));
            hide(document.getElementById("tokenFunctionWorkAreaCancelBtn"));
            if (withdrawAll === true) {
              await withdrawAll(accountAddress, suggestedFee).then(() => {
                tokenActionStatus.innerHTML = "WITHDRAWAL SUCCESSFUL<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
                tokenActionStatus.classList.remove("tokenActionPending");
                tokenActionStatus.classList.add("tokenActionSuccess");
                walletConnectOverlayEl.style.zIndex = 0;
                getERC20Info().then(() => {
                    updateTokenValues()
                });
              }).catch(error => {
                tokenActionStatus.innerHTML = error.message + "<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
                tokenActionStatus.classList.remove("tokenActionPending");
                tokenActionStatus.classList.add("tokenActionFailed");
              });
            } else {
              let inputElWithdrawValue = new BigNumber(document.getElementById("tokenWithdrawalNumbers").value);
              // Don't forget, the max value is restrained to the wallet balance of
              // $PAST tokens in the input filter function
              let precisionWithdrawalValue = inputElWithdrawValue.shiftedBy(erc20Decimals).toString();
              await withdraw(accountAddress, precisionWithdrawalValue, suggestedFee).then(() => {
                tokenActionStatus.innerHTML = "STAKING SUCCESSFUL<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
                tokenActionStatus.classList.remove("tokenActionPending");
                tokenActionStatus.classList.add("tokenActionSuccess");
                walletConnectOverlayEl.style.zIndex = 0;
                getERC20Info().then(() => {
                  updateTokenValues()
                });
              }
            ).catch(error => {
                tokenActionStatus.innerHTML = error.message + "<div class='dashboardButton' onClick='closeTokenActionStatus(this)'>Close</div>";
                tokenActionStatus.classList.remove("tokenActionPending");
                tokenActionStatus.classList.add("tokenActionFailed");
              });
            }
            break;
        };
        break;
      case "gemFunctionWorkArea" :
        switch(gemFunctionWorkArea.getAttribute("workArea")){
          case "gemStake" :
            let isApproved = nftIsApprovedForAll(accountAddress).then(result => {
              if (!result) {
                nftSetApprovalForAll(accountAddress, suggestedFee).then(
                    result => stakeTheGems()
                ).catch(error => console.log(error));
              } else {
                stakeTheGems();
                walletConnectOverlayEl.style.zIndex = 0;
              }
            }).catch(error => console.log(error));

          break;
          case "gemUnstake" :
            unStakeTheGems();

            break;
          case "gemClaim" :
            let claimableNft = nftClaimRewards(accountAddress, suggestedFee).catch(error => {alert(error.message);});

            break;

        }
        break;
    }
    hide(this.parentElement);
    show(document.getElementById("tokenFunctionWorkAreaApproveBtn"));
    show(document.getElementById("tokenFunctionWorkAreaCancelBtn"));
    document.getElementById("tokenFunctionWorkAreaCancelBtn").click();
    this.onclick = null;
  });
}

function stakeTheGems() {
  let gemsToStake = [];
  let colorsToStake = [];
  gemsSelected.forEach(gem => {
    if (!gemsToStake.includes(gem)) {
      gemsToStake.push(gem);
    }
    let theColor = parseInt(getColor(gem));
    if (!colorsToStake.includes(theColor)) {
      colorsToStake.push(theColor);
    }
    let theNft = gemList.get(gem);
    theNft.isPending = true;
    theNft.isSelected = false;
    theNft.canBeSelected = true;

  });
  gemsSelected = [];
  updateGemList(false);

  nftStakeMultiple(accountAddress, gemsToStake, colorsToStake, suggestedFee).catch(error => {
    console.log(error);
    gemList.forEach(nft => nft.isPending = false);
    updateGemsValues();
  });
}

function unStakeTheGems() {
  let gemsToUnStake = [];
  let colorsToUnStake = [];
  gemsSelected.forEach(gem => {
    if (!gemsToUnStake.includes(gem)) {
      gemsToUnStake.push(gem);
    }
    let theColor = getColor(gem);
    if (!colorsToUnStake.includes(theColor)) {
      colorsToUnStake.push(theColor);
    }
    let theNft = gemList.get(gem);
    console.log("Set PENDING on nft #" + gem + " [" + theNft.name + theNft.id +"]");
    theNft.isPending = true;
    theNft.isSelected = false;
    theNft.canBeSelected = true;
  });
  gemsSelected = [];
  updateGemList(true);

  nftUnStakeMultiple(accountAddress, gemsToUnStake, colorsToUnStake, suggestedFee).catch(error => {
    console.log(error);
    gemList.forEach(nft => nft.isPending = false);
    updateGemsValues();
  });
}

function addWorkAreaCancelButton(workArea) {
  makeDiv(workArea, workArea.id + "CancelBtn", "workAreaButton", htmlFunctionWorkAreaCancelButtonText);
  workArea.querySelector("#" + workArea.id + "CancelBtn").classList.add("cancel");
  workArea.querySelector("#" + workArea.id + "CancelBtn").addEventListener("click", function () {
    clearInterval(theCountDownTimer);
    theCountDownTimer = 0;
    walletConnectOverlayEl.classList.add("connected");
    walletConnectOverlayEl.style.zIndex = 0;
    hide(this.parentElement);
    this.onclick = null;
  });
}

function showPage() {

  walletConnectOverlayEl.classList.add("connected");
  document.getElementById("networkInfo").classList.add("connected");
  walletConnectEl.classList.add("connected");
  walletConnectEl.innerHTML = strWalletConnected + "<br><strong><a href='https://etherscan.io/address/" + accountAddress + "' target='etherscan' >" + shortAddress(accountAddress) + "</a></strong>";

  /* Populate these from the web3 payload */
  tokensTotalStakedEl.innerHTML = 0;
  tokensPastEarnedEl.innerHTML = 0;
  gemsTotalStakedEl.innerHTML = getGemsStakedValue(0);
  gemsPastEarnedEl.innerHTML = 0;

  /* Add the highlight class */
  tokensTotalStakedEl.classList.add("infoboxValueHighlight");
  tokensPastEarnedEl.classList.add("infoboxValueHighlight");
  /* Note we DO NOT need to add this class to the gemsTotalStakedValue as this is an inline-formatted HTML response */
  gemsPastEarnedEl.classList.add("infoboxValueHighlight");

}

function restart() {
  console.log("Connecting");
  walletConnected = false;
  initialConnection = true;
  let loginTimer = 0;
  let loginTimeout = setInterval(function () {
    loginTimer++;
    if (walletConnected && loginTimer < 15) {
      clearInterval(loginTimeout);
    }
  }, 1000);
  walletChanged();
}

walletConnectEl.addEventListener("click", async() => {
  walletConnected = await getNetwork().catch(() => {
    show(walletNotConnectedEl);
  });
  restart();
});

function continueAnyway() {
  continueWithoutPAST = true;
  hide(walletNotConnectedEl);
  walletConnectEl.classList.add("connected");
  walletConnectEl.innerHTML = "NO PAST TOKENS";
  walletConnectOverlayEl.classList.add("connected");
  walletConnectOverlayEl.style.zIndex = 0;
  disableBtn("btnTokenStake", showTokenStakingWindow);
  updateTokenValues();
}

function cancelButtonClick(el) {
  hide(tokenFunctionWorkArea);
  hide(gemFunctionWorkArea);
  hide(el.parentElement);
  hide(el);

  walletConnected = false;
  walletConnectEl.classList.remove("connected");
  walletConnectOverlayEl.style.zIndex = 60;
  walletConnectOverlayEl.classList.remove("connected");
  document.getElementById("networkInfo").classList.remove("connected");
  show(walletConnectEl, strWalletConnect, true);
}

function addValueRowItem(amountTokensStaked, symbol){
  return "<div class='tokenDetailRow large'><div class='detailPastUSD'>" + cryptoFormat("$",(ethUSD * parseFloat(amountTokensStaked)), true, 2) + "</div><div class='detailPastTokens'>" + cryptoFormat(" " + symbol, amountTokensStaked, false, 0) + "</div></div>";
}

function addWalletRowItem(ethUSD, walletBalanceETH, pastTokens, stakedTokens){
  let totalWalletValue = (ethUSD * parseFloat(pastTokens)) + (ethUSD * parseFloat(stakedTokens));
  let tokenPercentage = pastTokens > 0 ? (ethUSD * parseFloat(pastTokens)) / totalWalletValue * 100 : 0;
  let response = "<div class='tokenDetailRow large'>";
  response += "<div class='walletIcon'></div>";
  response += "<div class='walletRowValues'>";
  response += "<div class='walletRowHeading'>Balance</div>";
  response += "<div class='walletRowBalance' id='walletBalanceUSD'>" + cryptoFormat("$", (ethUSD * parseFloat(walletBalancePAST)), true, 2) + "<div class='tokenPercentage' id='walletBalanceETH'>" + cryptoFormat("Ξ",walletBalanceETH, false, 6) + "</div></div>";
  response += "<div class='walletRowPastTokens'>" + cryptoFormat(" " + erc20Symbol, pastTokens, false, 0) + "<div class='tokenPercentage'>" + cryptoFormat("&percnt;",tokenPercentage, false, 2) + "</div></div>";
  response += "</div>";
  return response;
}

function addRowItem(key, value, symbol, front, decimals){
  let calculatedValue = cryptoFormat(symbol, value, front, decimals);
  return "<div class='tokenDetailRow normal'><div class='tokenDetailRowItem'>" + key + "</div><div class='tokenDetailRowValue'>" + calculatedValue + "</div></div>";
}
function hide(el) {
  el.classList.add('hide');
  el.classList.remove('show');
}

function show(el, message, maskBackground) {
  if (message != null) {
    el.innerHTML = message;
  }
  el.classList.add('show');
  el.classList.remove('hide');
  if (maskBackground) {
    walletConnectOverlayEl.classList.remove("connected");
  }
}

function cryptoFormat(symbol, value, front, decimals) {
  let number = typeof value === 'number';
  if (number) {
     value = value.toLocaleString();
  }
  return front ? (number ? symbol : "") + value : value + (number ? symbol : "");
}

function populateTokensInfoDetail(){
  let theInfo = "";
  theInfo += "<div class='tokenDetailRow normal info Equity'>This is the percentage of your $PAST balance that you have staked</div>";
  theInfo += "<div class='tokenDetailRow large info StakedInfo'>USD Value<br>$PAST Staked</div>";
  theInfo += "<div class='tokenDetailRow normal info AverageCost'>Token purchase average price</div>";
  theInfo += "<div class='tokenDetailRow normal info PaidFees'>Total fees paid for all transactions</div>";
  theInfo += "<div class='tokenDetailRow normal info ProfitLoss'>This will show your current profit or loss in USD</div>";
  theInfo += "<div class='tokenDetailRow normal info 24HourReturn'>Your USD return over the past 24 hours</div>";
  theInfo += "<div class='tokenDetailRow normal info Network'>You are connected to the " + activeNetwork + "</div>";
  theInfo += "<div class='tokenDetailRow large info WalletInfo'>This is your active wallet information</div>";
  return theInfo;
}

function populateGemsInfoDetail(){
  let theInfo = "";
  theInfo += "<p><br><br>GEM Staking information will be populated when the NFTs are live.</p>";
  return theInfo;
}

function updateTokenValues(){
  let tokenDetail = "";
  if( ((walletBalancePAST > 0) || (walletStakedPAST > 0) || (walletRewardsPAST > 0)) || continueWithoutPAST) {
    tokenDetail += addRowItem("Equity", equityStakedPerc, "&percnt;", false, 2);
    tokenDetail += addValueRowItem(walletStakedPAST, erc20Symbol);
    tokenDetail += addRowItem("Average Cost", averageCost, "$", false, 2);
    tokenDetail += addRowItem("Paid Fees", paidFees, "$", true, 2);
    tokenDetail += addRowItem("Profit/Loss", profitLoss, "$", true, 2);
    tokenDetail += addRowItem("24-Hour Return", return24h, "$", true, 2);
    tokenDetail += addRowItem(activeNetwork, "<img src='img/ethereum.png' />", "", false, 0);
    tokenDetail += addWalletRowItem(ethUSD, walletBalanceETH, walletBalancePAST, walletStakedPAST);
    stakedTokensDetail.innerHTML = tokenDetail;
    tokensTotalStakedEl.innerHTML = formatTokensForHeroDisplay(walletStakedPAST);
    tokensPastEarnedEl.innerHTML = formatTokensForHeroDisplay(walletRewardsPAST);
    if (walletRewardsPAST > 20000) {
      enableBtn("btnTokenCompound", showTokenCompoundWindow);
      enableBtn("btnTokenClaim", showTokenClaimWindow);
      showClaimAlert("tokens");
    } else {
      disableBtn("btnTokenCompound", showTokenCompoundWindow);
      disableBtn("btnTokenClaim", showTokenClaimWindow);
      hideClaimAlert("tokens");
    }
    show(stakedTokensDetail);
    if (currentGas != null) {
      show(currentGasEl);
      currentGasEl.innerHTML = "<span style='color:white;'>" + strCurrentGasMessage + "</span><br/><strong>" + cryptoFormat("Ξ", currentGas, false,6) + "</strong>";
      if (currentGas <= 0.01) {
        currentGasEl.classList.remove("medium");
        currentGasEl.classList.add("low");
      } else if (currentGas <= 0.02) {
        currentGasEl.classList.remove("low");
        currentGasEl.classList.add("medium");
      } else {
        currentGasEl.classList.remove("low");
        currentGasEl.classList.remove("medium");
      }
    }
    if (stakingCooldownTimer <= 0 && !continueWithoutPAST) {
      document.getElementById("btnTokenStake").innerHTML = "Stake";
      enableBtn("btnTokenStake", showTokenStakingWindow);
    } else{
      if (!continueWithoutPAST) {
        document.getElementById("btnTokenStake").innerHTML = toHHMMSS(stakingCooldownTimer > 0 ? stakingCooldownTimer-- : 0);
        disableBtn("btnTokenStake", showTokenStakingWindow);
      }
    }
    if (walletStakedPAST > 0) {
      enableBtn("btnTokenWithdraw", showTokenWithdrawWindow);
    }
  } else {
    disableBtn("btnTokenStake", showTokenStakingWindow);
    disableBtn("btnTokenWithdraw", showTokenWithdrawWindow);
    show(walletNotConnectedEl,strNoPASTTokensFound + strContinueCancelButtons, true);
    console.log("Setting overlay z-index to 65");
    walletConnectOverlayEl.style.zIndex = 65;
    walletNotConnectedEl.style.cursor = "normal";
  }
}

function getGemsStakedValue(gemsStaked) {

  if (gemsStaked % 2 === 0) gemsStaked--;

  return "<div><strong>" + "3&nbsp;...&nbsp;5&nbsp;...&nbsp;7&nbsp;...&nbsp;9&nbsp;...&nbsp;11".replaceAll(String(gemsStaked),"<span class='infoboxValueHighlight'>"+String(gemsStaked)+"</span>") + "</strong></div>";
}

function updateGemsValues() {
  /* Get the gems */
  if (gemList.size > 0 || gemsStakeInfo[0] > 0 || gemsStakeInfo[1] > 0) {
    /* assign click functions to buttons and remove disabled class */
    if (hasOneBillionStaked) {
      // TODO: Uncomment the below line when NFTs are a GO
//      enableBtn("btnNftClaim", showGemClaimWindow);
      showClaimAlert("gems");
    } else {
      hideClaimAlert("gems");
      disableBtn("btnNftClaim", showGemClaimWindow);
    }

    let numberOfUniqueStakedGemsTypes = gemsStakeInfo[0];
    let gemRewards = gemsStakeInfo[1];

    // Update the 'TOTAL STAKED' info
    if(numberOfUniqueStakedGemsTypes >= 3)gemsTotalStaked.innerHTML = getGemsStakedValue(numberOfUniqueStakedGemsTypes);
    // Update the '$PAST Earned' info
    gemsPastEarnedEl.innerHTML = formatTokensForHeroDisplay(gemRewards / Math.pow(10, erc20Decimals));
    let firstPass = true;
    gemList.forEach(function(nft, theId) {
      let htmlResponse = "";
      let htmlNftStaked = "";
      htmlResponse += "<div id='gem" + theId + "' class='gemItem";
      if (nft.isSelected) {
        htmlResponse += " selected";
      }
      if (nft.isStaked) {
        htmlResponse += " staked";
        htmlNftStaked = "<div class='gemItemStakedOverlay " + (nft.isSelected ? "selected" : "") + "'></div>";
      } else {
        htmlResponse += " unstaked";
        htmlNftStaked = "";
      }
      if (!nft.canBeSelected) {
          htmlResponse += " ignore";
      }
      htmlResponse += "' onclick='checkGemSelection(" + nft.id + ");' ";
      htmlResponse += "style='background: transparent url(" + nft.image + ") center center no-repeat;overflow: hidden;background-size: 185%;'>";
      htmlResponse += "<div class='pending";

      if (nft.isPending) {
        htmlResponse += " show";
      }
      htmlResponse += "'></div>";
      htmlResponse += htmlNftStaked;
      htmlResponse += "<div class='gemTokenId'>#" + theId + "</div>";
      htmlResponse += "</div>";
      if (firstPass) {
        stakedGemsDetail.innerHTML = htmlResponse;
        firstPass = false;
      } else {
        stakedGemsDetail.innerHTML += htmlResponse;
      }
    });
    show(stakedGemsDetail);
  } else {
    unbindGemButtons();
  }
}


function checkGemSelection(theId){
  let theNft = gemList.get(theId);
  if (theNft.canBeSelected) {
    let unstaking = false;
    if (gemsSelected.includes(parseInt(theId))) {
      // The gem had been previously selected, so remove it from the list
      gemsSelected.splice(gemsSelected.indexOf(theId), 1);
      theNft.isSelected = false;
    } else {
      // The gem had not been previously selected, so add it to the list
      gemsSelected.push(theId);
      theNft.isSelected = true;
    }
    if (theNft.isStaked) {
      unstaking = true;
    } else {
      unstaking = false;
    }
    updateGemList(unstaking);
  }
}

function getSelectedColors() {
  let selectedColors = [];
  gemsSelected.forEach(nft => {
    let theColor = getColor(nft);
    if (!selectedColors.includes(theColor)) {
      selectedColors.push(theColor);
    }
  });
  return selectedColors;
}

function updateGemList(unstaking) {
  disableBtn("btnNftStake", showGemStakingWindow);
  disableBtn("btnNftUnstake", showGemUnstakingWindow);
  if (gemsSelected.length === 0 || unstaking === null) {
    gemList.forEach(nft => {
      nft.canBeSelected = true;
      if (stakedColors.includes(nft.color) && !nft.isStaked) {
        nft.canBeSelected = false;
      } else {
        nft.canBeSelected = true;
      }
    });
  } else {
    let selectedColors = getSelectedColors();
    gemList.forEach(nft => {
      if (!nft.isSelected && ((unstaking && !nft.isStaked) || (!unstaking && nft.isStaked))) {
        nft.canBeSelected = false;
      }
      if (selectedColors.includes(nft.color) && !gemsSelected.includes(parseInt(nft.id))) {
        nft.canBeSelected = false;
      }
      if (!unstaking && (!selectedColors.includes(nft.color) && !stakedColors.includes(nft.color))) {
        nft.canBeSelected = true;
      }
    });
    if (unstaking) {
      // TODO: Uncomment the below line when NFTs are a go
      // enableBtn("btnNftUnstake", showGemUnstakingWindow);
    } else {
      // TODO: Uncomment the below line when NFTs are a go
      // enableBtn("btnNftStake", showGemStakingWindow);
    }
    gemsSelected.sort(function (a, b) {
      return parseInt(a.id) - parseInt(b.id);
    });
  }
  updateGemsValues();
}

async function getERC20Info() {
  let wei = getBalanceETH();
  let convertedWei = Web3Client.utils.fromWei(await wei ,"ether");
  let pastBalance = getPastBalance(accountAddress);
  //let pendingTransactions = await getPendingTransactions(accountAddress);
  claimRewardsTimer = await compoundRewardsTimer(accountAddress);

  try {

    // Token functions and updates
    walletBalanceETH = parseFloat(convertedWei);
    walletBalancePAST = await pastBalance / Math.pow(10, erc20Decimals);
    pastValueUSD = walletBalancePAST * ethUSD;
    let depositInfo = [];
    depositInfo = await getTokenStakingDepositInfo(accountAddress);
    walletStakedPAST = parseFloat(new BigNumber(depositInfo[0]).shiftedBy(-erc20Decimals));
    walletRewardsPAST = parseFloat(new BigNumber(depositInfo[1]).shiftedBy(-erc20Decimals));
    stakingCooldownTimer = depositInfo[2];
    if ((walletBalancePAST > 0) || (walletStakedPAST > 0) || (walletRewardsPAST > 0)) {
      continueWithoutPAST = false;
    }

    hasOneBillionStaked = await getHasOneBillionStaked(accountAddress);
    equityStakedPerc = walletStakedPAST > 0 ? (walletStakedPAST / (walletStakedPAST + walletBalancePAST)) * 100 : 0;
    return24h = ((tokenAPR / 365) + 1) * walletStakedPAST;
    currentGas = await Web3Client.eth.getGasPrice() / (Math.pow(10, GweiToEthDecimals));
    suggestedFee = parseFloat(currentGas * (Math.pow(10, EthToGasDecimals))  * suggestedFeeMultiplier).toFixed(0).toString() ;

  } catch (error) {
    console.log(error);
  }
  tokenInfoDetail.innerHTML = populateTokensInfoDetail();
}

async function getTokenContractDetails() {
  if (tokenContract != null) {
    erc20Decimals = parseInt(await getTokenDecimals());
    erc20Symbol = await getTokenSymbol();
    erc20Name = await getTokenName();
  }
}

async function getNftInfo() {
  let unstaking = false;
  let nftCount = parseInt(await nftBalanceOf(accountAddress));
  let stakedGems = await nftTokensStakedByUser(accountAddress);
  gemsStakeInfo = await nftUserStakeInfo(accountAddress);
  let selectedColors = getSelectedColors();
  if((previousNumberNFTsStaked !== stakedGems.length) || gemList.length === 0) {
    previousNumberNFTsStaked = stakedGems.length;
    let nfts = new Map();
    stakedColors = [];
    stakedGems.forEach((tokenId) => {
      let nft = new Nft(tokenId, getColor(tokenId), "gem");
      nft.isStaked = true;
      nft.isSelected = false;
      nft.canBeSelected = true;
      nft.isPending = false;
      if (!nfts.has(parseInt(tokenId))) {
        nfts.set(parseInt(tokenId), nft);
      }
      if (!stakedColors.includes(nft.color)) {
        stakedColors.push(nft.color);
      }
      // set the overall unstaking or staking var
      if (selectedColors.includes(nft.color)) {
        unstaking = true;
        nft.isSelected = true;
      }
    });

    for (let i = 0; i < await nftCount; i++) {
      let tokenId = await nftTokenOfOwnerByIndex(accountAddress, i);
      let nft = new Nft(tokenId, getColor(tokenId), "gem");
      if (gemsSelected.includes(parseInt(tokenId))) {
        nft.isSelected = true;
      }
      if (stakedColors.includes(nft.color) || (selectedColors.includes(nft.color) && !gemsSelected.includes(parseInt(tokenId)))) {
        nft.canBeSelected = false;
      } else {
        nft.canBeSelected = true;
      }
      if (!nfts.has(parseInt(tokenId))) {
        nfts.set(parseInt(tokenId),nft);
      }
    }
    gemList = sortTheMap(nfts);
    // Work out the staked and selected gems
    updateGemList(unstaking);
  } else {
    if (gemList.size > 0 || gemsStakeInfo[0] > 0) {
      /* assign click functions to buttons and remove disabled class */
      show(stakedGemsDetail);
    }
  }
  gemInfoDetail.innerHTML = populateGemsInfoDetail();
}


function getNumberOfColorsStaked(gemsStaked) {
  let listOfUniqueGemTypesStaked = [];
  gemsStaked.forEach(gem => {
    let gemType = getColor(gem);
    if (!listOfUniqueGemTypesStaked.includes(gemType)) listOfUniqueGemTypesStaked.push(gemType);

  });
  return(listOfUniqueGemTypesStaked);
}

function shortAddress(address){
  return address.substring(0,6) + "..." + address.substring(address.length - 4);
}

const makeTag = (tagName, parentOrSelector, id, className, text) => {
  const tag = document.createElement(tagName);
  if (id) tag.id = id;
  if (className) tag.classList.add(className);
  if (text) tag.append(text);
  const parentElement = (typeof parentOrSelector === 'object')
      ? parentOrSelector
      : document.querySelector(parentOrSelector);
  parentElement.appendChild(tag);
  return tag;
}

const addDataset = (tag, dataAttrs) => {
  // remember camelCase: val -> data-camel-case="val"
  for (key in dataAttrs) {
    tag.dataset[key] = dataAttrs[key];
  }
}

const makeDiv = (parentOrSelector, id, className, text) => (
    makeTag('div', parentOrSelector, id, className, text)
);

function setInputFilter(textbox, inputFilter, maxValue) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value) && this.value <= maxValue /*&& this.value > 0*/) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
    });
  });
}

function formatTokensForHeroDisplay(tokens){
  if (tokens * 1000 >= 1000000000000000) {
    return (tokens * 1000 / 1000000000000000).toFixed(8).replace(/\.0$/, '') + ' Quintillion';
  }
  if (tokens >= 1000000000000000) {
    return (tokens / 1000000000000000).toFixed(7).replace(/\.0$/, '') + ' Quadrillion';
  }
  if (tokens >= 1000000000000) {
    return (tokens / 1000000000000).toFixed(6).replace(/\.0$/, '') + ' Trillion';
  }
  if (tokens >= 1000000000) {
    return (tokens / 1000000000).toFixed(5).replace(/\.0$/, '') + ' Billion';
  }
  if (tokens >= 1000000) {
    return (tokens / 1000000).toFixed(4).replace(/\.0$/, '') + ' Million';
  }
  if (tokens >= 1000) {
    return (tokens / 1000).toFixed(3).replace(/\.0$/, '') + ' k';
  }
  return tokens;
}



function showPendingTransaction(message){
  //TODO: Show a 'Pending transactions' popup
}

function showSuccessTransaction(message){
  //TODO: Show a 'Pending transactions' popup
}

function showFailedTransaction(message){
  //TODO: Show a 'Pending transactions' popup
}

function showClaimAlert(tokensOrGems) {
  let whichButton = tokensOrGems === "tokens" ? "btnTokenClaim" : "btnNftClaim";
  show(document.getElementById(whichButton).querySelector(".claimable"));
}

function hideClaimAlert(tokensOrGems) {
  let whichButton = tokensOrGems === "tokens" ? "btnTokenClaim" : "btnNftClaim";
  hide(document.getElementById(whichButton).querySelector(".claimable"));
}

const toHHMMSS = (secs) => {
  let sec_num = parseInt(secs, 10)
  let hours   = Math.floor(sec_num / 3600)
  let minutes = Math.floor(sec_num / 60) % 60
//  let seconds = sec_num % 60

  return [hours,minutes/*,seconds*/]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v,i) => v !== "00" || i > 0)
      .join("h")
      + "m";

}

function sortTheMap(unsortedMap) {
  let unsortedArray = [...unsortedMap];
  let sortedArray = unsortedArray.sort(([nftId1,nft1], [nftId2, nft2]) =>
      nftId1 - nftId2
  )
  return new Map(sortedArray);
}

if (!isMobile()) {
  show(document.querySelector(".ky-el-follow-us"));
}

initMain();







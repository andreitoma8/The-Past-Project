const devMode = 1;

const strActiveNetwork = devMode === 0 ? "Ethereum MainNet" : "Rinkeby Testnet";
let NFT_CONTRACT_ADDRESS, nftContract,
    NFT_STAKING_CONTRACT_ADDRESS, nftStakingContract,
    TOKEN_CONTRACT_ADDRESS, tokenContract,
    TOKEN_STAKING_CONTRACT_ADDRESS, tokenStakingContract;

let Web3Client;

let networkChangeTimer;
const updateFrequency = 5000;
const weiToEthDecimals = 18;
const GweiToEthDecimals = 12;
const EthToGasDecimals = 9;
let initialConnection = true;
let timerERC20, timerGEMS;

let networkChain = "";

/***********************************************/
/* web3 functions below for ease of navigation */
/***********************************************/
async function getWeb3Client() {

    console.log("Is mobile?: " + isMobile());
    if (window.ethereum) {
        return handleEthereum();
    } else if (window.web3){
        console.log("Using window.web3");
        window.ethereum = window.web3;
        return new Web3(window.ethereum);
    } else {
        window.addEventListener('ethereum#initialized', handleEthereum, {
            once: true,
        });

        // If the event is not dispatched by the end of the timeout,
        // the user probably doesn't have MetaMask installed.
        Web3Client = setTimeout(handleEthereum, 3000); // 3 seconds
    }

   return null;
}

function handleEthereum() {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
        console.log('Ethereum successfully detected!');
        return new Web3(ethereum);
    } else {
        console.log('Please install MetaMask!');
        return null;
    }
}

function handleAccountsChanged(accounts) {
    hide(walletNotConnectedEl);
    if (accounts && accounts[0] !== accountAddress) {
        if (networkChangeTimer !== null) {
            clearInterval(networkChangeTimer);
            networkChangeTimer = setInterval(function() {
                getNetwork().catch(() => {
                    show(walletNotConnectedEl, strWalletNotConnected + strContinueCancelButtons, true);
                });
            }, 5000);
        }

        if (accounts.length === 0 && !initialConnection) {
            walletConnected = false;
            hide(currentGasEl);
            show(walletNotConnectedEl, strNoWeb3InBrowser + strContinueCancelButtons, true);
            walletConnectEl.classList.remove("connected");
            walletConnectEl.innerHTML = strWalletConnect;
            walletConnectOverlayEl.classList.remove("connected");
        } else {
            clearInterval(timerERC20);
            clearInterval(timerGEMS);
            accountAddress = accounts[0];
            walletConnected = true;

            NFT_CONTRACT_ADDRESS = "0x7c98D1Ec7e1940B9EBc29fFF9FD035D0BE7A3cc1"; //Rinkeby
            nftContract = new Web3Client.eth.Contract(pastNFTABI, NFT_CONTRACT_ADDRESS);

            NFT_STAKING_CONTRACT_ADDRESS = "0xa2E5d5133e2013bE95311Be53F418e42844bf195";
            nftStakingContract = new Web3Client.eth.Contract(stakingNFTContractABI, NFT_STAKING_CONTRACT_ADDRESS);

            TOKEN_CONTRACT_ADDRESS = "0x656aa0c09B9928E49f635dA0CbbBABdA2D245a54"; //Rinkeby
            tokenContract = new Web3Client.eth.Contract(pastTokenContractABI,TOKEN_CONTRACT_ADDRESS);

            TOKEN_STAKING_CONTRACT_ADDRESS = "0x40A1e2E7EeF7a944b4EC20AbC8aCB80aCAdE424D"; //Rinkeby
            tokenStakingContract = new Web3Client.eth.Contract(stakingTokenContractABI, TOKEN_STAKING_CONTRACT_ADDRESS);

            getTokenContractDetails().then(() => {
                document.title = erc20Name + " " + erc20Symbol + " Dashboard";
                getERC20Info().then(() => {
                    updateTokenValues();
                    /* set up call to check details every 'updateFrequency' seconds */
                    timerERC20 = setInterval(function () {
                        getERC20Info().then(() => {
                                updateTokenValues();
                            }
                        );
                    }, updateFrequency)

                });
                getNftInfo().then(() => {
                    /* set up call to check details every 'updateFrequency' seconds */
                    timerGEMS = setInterval(function () {
                        getNftInfo().catch(console.log);
                    }, updateFrequency)
                }).catch(console.log)
            }).catch(() => {
                show(walletNotConnectedEl, strNoPASTContractFound + strContinueCancelButtons, true);
                walletConnectOverlayEl.style.zIndex = 65;
            });
            showPage();
        }
    }
}

function connect() {
    console.log("In connect()");
    if (Web3Client != null) {
        walletConnected = false;
        console.log("Initial connection: " + initialConnection);
        try {
            window.ethereum.on('chainChanged', function (accounts) {
                console.log("chainChanged -> initialConnection");
                initialConnection = true;
                getNetwork().then(walletChanged);
                handleAccountsChanged(accounts);
            });

            window.ethereum.on('accountsChanged', function (accounts) {
                handleAccountsChanged(accounts);
            });

            if (!initialConnection) {
                console.log("accountsChanged -> !initialConnection");
                window.ethereum.on('accountsChanged', function (accounts) {
                    handleAccountsChanged(accounts);
                });
            } else {
                // This is the initial connection after a wallet / network change
                console.log("accountsChanged -> initialConnection");
                window.ethereum.request({method: 'eth_requestAccounts'})
                    .then(function(accounts) {
                        handleAccountsChanged(accounts);
                     })
                    .catch((err) => {
                        if (err.code === 4001) {
                            // User rejected the connection.
                            console.log('Please connect to a Web3 wallet, such as MetaMask or Coinbase Wallet.');
                            walletConnectOverlayEl.classList.remove("connected");
                            show(walletNotConnectedEl, strNoWeb3InBrowser + strContinueCancelButtons, true);
                            return true;
                        } else {
                            console.error(err);
                            walletConnectOverlayEl.classList.remove("connected");
                            show(walletNotConnectedEl, strWalletNotConnected + strContinueCancelButtons, true);
                            return true;
                        }
                    });
                initialConnection = false;
            }




        } catch (error) {
            console.log(error);
            walletConnectOverlayEl.classList.remove("connected");
            show(walletNotConnectedEl, strWalletNotConnected + strContinueCancelButtons, true);
            return true;
        }
    } else {
        walletConnectOverlayEl.classList.remove("connected");
        show(walletNotConnectedEl, strNoWeb3InBrowser + strContinueCancelButtons, true);
        return true;
    }
}

function getBalanceETH() {
    let wei = Web3Client.eth.getBalance(accountAddress).then( result => {
        return result;
    }).catch(error => {
        console.log(error);
    });
    return wei;
}

async function walletChanged() {
    // 'DISCONNECT' and reset;
    walletConnected = false;
    hide(walletNotConnectedEl);
    hide(walletConnectEl);
    hide(currentGasEl);

    gemList = [];
    unbindTokenButtons();
    unbindGemButtons();
    // hide(stakedTokensDetail);
    // hide(stakedGemsDetail);

    Web3Client = await getWeb3Client();
    console.log("in walletChanged()... ",Web3Client);
    initialConnection = true;
    walletBalanceETH = 0.0;
    walletBalancePAST = 0.0;
    walletStakedPAST = 0.0;
    walletRewardsPAST = 0.0;
    stakingCooldownTimer = 0;
    claimRewardsTimer = 0;
    hasOneBillionStaked = false;
    pastValueUSD = 0.0;
    equityStakedPerc = 0.0;
    pastPayable = 0;
    return24h = 0.0;
    previousNumberNFTsStaked = 0;
    gemsSelected = [];
    gemsStakeInfo = [];
    stakedColors = [];
    connect();
}

async function getNetwork() {
    let currentNetwork = getNetworkName(await Web3Client.eth.net.getId());
    if (networkChain !== currentNetwork) {
        networkChain = currentNetwork;
    }
}

function getNetworkName(chainID) {
    let networks = {
        1:"Ethereum Mainnet",
        3:"Ropsten TestNet",
        4:"Rinkeby TestNet",
        5:"Goerli TestNet",
        56:"Binance Smart Chain Mainnet [BNB]",
        97:"Binance Smart Chain TestNet [tBNB]",
        137:"Polygon Mainnet"
    }
    updateNetwork(networks[chainID]);
    return networks[chainID];
}

function updateNetwork (connectedNetwork) {
    activeNetwork = connectedNetwork;
    document.getElementById("networkName").innerHTML = connectedNetwork;
}


function isMobile() {
    return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)));
}
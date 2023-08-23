    
const generateAccounts = async (_client) => {
    let XrplClient = _client || xrplClient;
    let test_wallet = xrpl.Wallet.fromSeed("sEdT4taECzQDxGX2tosB9gwiUUPEx51")
    return test_wallet;
  };


  async function mintNFT() {
    let txObj = await prepareMintTransaction(xrplClient, selectedAccount.wallet);
    await signTransaction(txObj)
  }
  async function signTransaction(txObj) {

    // signing transaction
    _signTransactionAndBroadcast(
      txObj, xrplClient,
      selectedAccount.wallet,
      selectedChain,
      (res,e) => {
        console.log("transaction result ",res,e);
      }
    );

  }


  async function init() {
    let _client = await connectXRPL(setXRPLClient,selectedChain);
    await generateAccounts(_client);


  }

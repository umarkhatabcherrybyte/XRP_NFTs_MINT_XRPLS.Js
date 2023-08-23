import React, { useEffect, useRef, useState } from "react";
import {
  _signTransaction,
  _signTransactionAndBroadcast,
  prepareMintTransaction,
} from "../api/Transaction";
import { chains} from "../api/data";
import { connectXRPL } from "../api/xrplApi";
import { VStack } from "@chakra-ui/react";
const xrpl = require("xrpl")


function AccountManager() {
  const [selectedChain, setSelectedChain] = useState(chains[0].name);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [xrplClient, setXRPLClient] = useState(null);
  const generateAccounts = async (_client) => {

    // setLoadingMessage("Gathering accounts...");
    let XrplClient = _client || xrplClient;

    let test_wallet = xrpl.Wallet.fromSeed("sEdT4taECzQDxGX2tosB9gwiUUPEx51")
    let _accountsObject = {
      name: "Account1 ",
      wallet: test_wallet,
    };
    let accountsArray = [_accountsObject]
    setXRPLClient(XrplClient);
    console.log("acount is ",accountsArray[0]);
    setSelectedAccount(accountsArray[0]);
    console.log("_");
    return accountsArray;
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
  useEffect(() => {
  init();
  }, []);
  


  return (
    <VStack spacing={5}>
      <button onClick={mintNFT}>mint</button>
    </VStack>
  );
}

export default AccountManager;

import React, { useEffect, useRef, useState } from "react";
import {
  _signTransaction,
  _signTransactionAndBroadcast,
  prepareMintTransaction,
} from "../api/Transaction";
import { chains } from "../api/data";
import { connectXRPL } from "../api/xrplApi";
import { VStack } from "@chakra-ui/react";
import { Xumm } from "xumm";
const xrpl = require("xrpl")

var xumm = new Xumm('2cc1e927-2d8e-4c9e-aa40-6ba3b75143e5', 'd44c0da1-63de-4acc-b223-ab1b58699588')

function AccountManager() {
  const [selectedChain, setSelectedChain] = useState(chains[0].name);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [xrplClient, setXRPLClient] = useState(null);
  const [connectedAddress, setConnectedAddress] = useState(null)
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
    console.log("acount is ", accountsArray[0]);
    setSelectedAccount(accountsArray[0]);
    console.log("_");
    return accountsArray;
  };

  async function mintTheNFT() {
    let accountInfo = await xrplClient.request({
      command: "account_info",
      account: connectedAddress,
      ledger_index: "validated",
    });
    let sequence = accountInfo.result.account_data.Sequence
    console.log("sequence is");
    const { created, resolved } = await xumm.payload.createAndSubscribe({
      "Account": connectedAddress,
      "TransactionType": "NFTokenMint",
      "NFTokenTaxon": 192,
      // "Issuer":connectedAddress,
      "Flags": 1,
      "URI": xrpl.convertStringToHex("https://ipfs.io/ipfs/QmR2qNydXQ2xwQZ8HoBMU9hitwig96WL4huQxpU6ViLpFE"),
      "Sequence": sequence, // as the mint tx is sent after the burn tx, we set the mint tx sequence as accoutnSequence plus one

    }, eventMessage => {
      if (Object.keys(eventMessage.data).indexOf('opened') > -1) {
        // Update the UI? The payload was opened.
      }
      if (Object.keys(eventMessage.data).indexOf('signed') > -1) {
        // The `signed` property is present, true (signed) / false (rejected)
        return eventMessage
      }
    })

    console.log('Payload URL:', created.next.always)
    console.log('Payload QR:', created.refs.qr_png)

    const payload = await resolved;

    console.log('Resolved', payload)
  }
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
      (res, e) => {
        console.log("transaction result ", res, e);
      }
    );

  }


  async function init() {
    let _client = await connectXRPL(setXRPLClient, selectedChain);
    setXRPLClient(_client)
    // await generateAccounts(_client);
  }
  useEffect(() => {
    init();
    xumm.on("ready", () => console.log("Ready (e.g. hide loading state of page)"))

    // We rely on promises in the `success` event: fired again if a user
    // logs out and logs back in again (resets all promises)
    xumm.on("success", async () => {
      xumm.user.account.then(account => {
        console.log("connected ", account)
        setConnectedAddress(account)
      })
    })

    xumm.on("logout", async () => {
      console.log("disconnected ")
      setConnectedAddress(null)

    })


  }, []);
  function connect() {
    xumm.authorize()
  }
  async function logout() {
    let res = await xumm.logout()
    console.log("disconnect", res);

  }
  console.log("xrplclient is ", xrplClient);

  return (
    <VStack spacing={5}>
      {
        connectedAddress != null ?
          <div>
            <p>Connected via : {connectedAddress}</p>
            <br />
            <button onClick={mintTheNFT}>mint</button>
            <br />

            <button onClick={logout}>logout</button>
          </div>
          : <button onClick={connect}>connect</button>


      }

      {/* <button onClick={mintNFT}>mint</button>
       */}
    </VStack>
  );
}

export default AccountManager;

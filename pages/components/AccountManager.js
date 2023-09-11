import React, { useEffect, useRef, useState } from "react";
import {
  _signTransaction,
  _signTransactionAndBroadcast,
  prepareMintTransaction,
} from "../api/Transaction";
import { chains, testnetProviders } from "../api/data";
import { VStack } from "@chakra-ui/react";
import { Xumm } from "xumm";
const xrpl = require("xrpl")

var xumm = new Xumm('f4da7833-89a4-494d-a121-61d6eb020888', '182c3a31-f2d3-406d-98d9-0f3b95c62aba')

function AccountManager() {
  const [selectedChain, setSelectedChain] = useState(chains[0].name);
  const [xrplClient, setXRPLClient] = useState(null);
  const [connectedAddress, setConnectedAddress] = useState(null)
  /** 
   * 
   * Backend
  */
  async function burnNFT(xrplClient_, XummClient) {
    console.log("xumm client", XummClient);

    const { created, resolved } = await XummClient.payload.createAndSubscribe({
      "Account": connectedAddress,
      TransactionType: 'NFTokenBurn',
      NFTokenID: "00010000897191DDF525A63AA3C8E114291F89907F43EF18BBBA02D300000078",
      Owner: connectedAddress
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
    console.log("Getting transaction details");
    getTransactions(xrplClient_);
    
  }

  async function getTransactions(xrplClient_) {
    let _accountInfo = await xrplClient_.request({
      command: "account_tx",
      "account": connectedAddress,
    });
    console.log("transactions are ", _accountInfo);
  }

  async function mintTheNFT(xrplClient_, XummClient) {
    console.log("xumm client", XummClient);

    let accountInfo = await xrplClient_.request({
      command: "account_info",
      account: connectedAddress,
      ledger_index: "validated",
    });
    let sequence = (accountInfo.result).account_data.Sequence
    console.log("sequence is");

    const { created, resolved } = await XummClient.payload.createAndSubscribe({
      "Account": connectedAddress,
      "TransactionType": "NFTokenMint",
      "NFTokenTaxon": 198,
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
    console.log("Getting transaction details");
    getTransactions(xrplClient_);

  }


  /**--------------------- */
  /******* FrontEnd ********/
  async function connectXRPL() {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    let res = await client.connect()
    return client;

  }
  async function mint() {
    await mintTheNFT(xrplClient, xumm)
  }
  async function burn() {
    await burnNFT(xrplClient, xumm)
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
            <button onClick={mint}>Mint</button>
            <br />

            <button onClick={burn}>Burn</button>

            <br />

            <button onClick={logout}>logout</button>
          </div>
          : <button onClick={connect}>connect</button>


      }


    </VStack>
  );
}

export default AccountManager;

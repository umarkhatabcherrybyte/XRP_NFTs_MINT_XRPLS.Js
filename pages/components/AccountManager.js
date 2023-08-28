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

var xumm = new Xumm('2cc1e927-2d8e-4c9e-aa40-6ba3b75143e5', 'd44c0da1-63de-4acc-b223-ab1b58699588')

function AccountManager() {
  const [selectedChain, setSelectedChain] = useState(chains[0].name);
  const [xrplClient, setXRPLClient] = useState(null);
  const [connectedAddress, setConnectedAddress] = useState(null)
/** 
 * 
 * Backend
*/
  async function mintTheNFT(xrplClient,XummClient) {
    let accountInfo = await xrplClient.request({
      command: "account_info",
      account: connectedAddress,
      ledger_index: "validated",
    });
    let sequence = (accountInfo.result).account_data.Sequence
    console.log("sequence is");

    const { created, resolved } = await XummClient.payload.createAndSubscribe({
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

  /**--------------------- */
  /******* FrontEnd ********/
  async function connectXRPL() {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    let res = await client.connect()
    return client;

  }
  async function mint(){
    await mintTheNFT(xrplClient,xumm)
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
            <button onClick={mint}>mint</button>
            <br />

            <button onClick={logout}>logout</button>
          </div>
          : <button onClick={connect}>connect</button>


      }

      
    </VStack>
  );
}

export default AccountManager;

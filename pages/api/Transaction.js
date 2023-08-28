import Web3 from "web3";
import { testnetProviders } from "./data";
const xrpl = require("xrpl")

export async function getWeb3(chain_name) {
  let HttpProviderURL = testnetProviders[chain_name];
  if (!HttpProviderURL) {
    return null;
  }

  let _provider = new Web3.providers.HttpProvider(HttpProviderURL);
  let _web3 = new Web3(_provider);

  return _web3;
}

export async function prepareMintTransaction(client, senderWallet) {
  // Prepare transaction -------------------------------------------------------
  let accountInfo = await client.request({
    command: "account_info",
    account: senderWallet.address,
    ledger_index: "validated",
  });
  let sequence = accountInfo.result.account_data.Sequence
  const prepared = await client.autofill({
    "Account": senderWallet.address,
    "TransactionType": "NFTokenMint",
    "NFTokenTaxon": 191,
<<<<<<< HEAD
    "Issuer":senderWallet.address,
    "Flags": 1,
    "Fee": "10",
    "URI": xrpl.convertStringToHex("https://ipfs.io/ipfs/QmR2qNydXQ2xwQZ8HoBMU9hitwig96WL4huQxpU6ViLpFE"),
=======
    "Flags": 1,
    "Fee": "10",
    "URI": xrpl.convertStringToHex("https://ipfs.io/ipfs/QmUNkTXruA4NP2nzUQGTBN42yzbhDzK1oM5N8BzmtxDZB5"),
>>>>>>> a07bd5d0c7c05f9c3f0eb4f9e51c68a37237942f
    "Sequence": sequence, // as the mint tx is sent after the burn tx, we set the mint tx sequence as accoutnSequence plus one

  })
  console.log("transaction obj", prepared);
  const max_ledger = prepared.LastLedgerSequence
  console.log("Prepared transaction instructions:", prepared)
  console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP")
  console.log("Transaction expires after ledger:", max_ledger)
  return prepared;
}



export async function _signTransactionAndBroadcast(
  transactionObject, xrplClient,
  wallet,
  selectedChain
) {

  // Sign prepared instructions ------------------------------------------------
  console.log("tx object ", transactionObject);
  const signed = wallet.sign(transactionObject)
  console.log("Identifying hash:", signed.hash)
  console.log("Signed blob:", signed.tx_blob)

  setTimeout(() => {
    broadcastTransaction(signed, xrplClient, selectedChain);
  }, 2000);

  return signed;

}

// Function to broadcast the signed transaction
export async function broadcastTransaction(
  signedTransaction, client, selectedChain
) {

  try {
    const tx = await client.submitAndWait(signedTransaction.tx_blob)
    // Check transaction results -------------------------------------------------
    console.log("Transaction result:", tx.result.meta.TransactionResult)
  }
  catch (e) {
    console.log("Tx broadcast error ", e);

  }

}

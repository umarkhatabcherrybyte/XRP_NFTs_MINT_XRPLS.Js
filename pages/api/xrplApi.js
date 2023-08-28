import { testnetProviders } from "./data";

const xrpl=require("xrpl")
export async function connectXRPL() {
    const client = new xrpl.Client(testnetProviders["testnet"]);
    let res = await client.connect()
    return client;

}

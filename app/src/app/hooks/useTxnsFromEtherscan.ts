import { useEffect, useState } from "react";

interface IEtherscanTxn {
    //"blockNumber":"14923678",
    blockNumber: string;
//     "timeStamp":"1654646411",
//    "hash":"0xc52783ad354aecc04c670047754f062e3d6d04e8f5b24774472651f9c3882c60",
//    "nonce":"1",
//    "blockHash":"0x7e1638fd2c6bdd05ffd83c1cf06c63e2f67d0f802084bef076d06bdcf86d1bb0",
//    "transactionIndex":"61",
    transactionIndex: string;

// "from":"0x9aa99c23f67c81701c772b106b4f83f6e858dd2e",
//    "to":"",
//    "value":"0",
//    "gas":"6000000",
//    "gasPrice":"83924748773",
//    "isError":"0",
//    "txreceipt_status":"1",
//    "input":"",
//     "contractAddress":"0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc",
//     "cumulativeGasUsed":"10450178",
//     "gasUsed":"4457269",
    gasUsed: string;
//     "confirmations":"122485",
//    "methodId":"0x61016060",
//    "functionName":""
}
interface ITxn {
    blockNumber: number;
    transactionIndex: number;
    gasUsed: number;
}

interface ITxnData {
    status: string;
    data: ITxn[];
  }
  
export function useTxnsFromEtherscan(address: `0x${string}` | undefined): ITxnData  {
    const [status, setStatus] = useState("loading");
    const [data, setData] = useState<ITxn[]>([]);
  
    useEffect(() => {
        if (!address) {
            console.log("no address found", address);
            return;
        }
      const fetchTxns = async () => {
        setStatus("loading");
        const offset = 4;
        const response = await fetch(
          `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${offset}&sort=desc&apikey=17HV2KFKB1XS55XI226P31QNZ8CV7K65KI`
        );
        const json = await response.json();
        if (json.status === "0") {
          setStatus("error");
          return;
        }
        console.log(json.result);
        const etherscanTxns: IEtherscanTxn[] = json.result;
        const txns: ITxn[] = etherscanTxns.map((txn) => ({
            blockNumber: parseInt(txn.blockNumber),
            transactionIndex: parseInt(txn.transactionIndex),
            gasUsed: parseInt(txn.gasUsed),
            }));
        setData(txns);
        setStatus("complete");
      };
      fetchTxns();
    }, [address]);
    return { status, data };
  }
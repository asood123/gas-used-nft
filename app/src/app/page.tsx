"use client";

import Title from '@/components/ui/Title'
import { forwardSearchParams } from '@/lib/utils'
import AdvanceStepButton from '@/components/ui/AdvanceStepButton';
import CodeBox from '@/components/ui/CodeBox';
import { useAccount } from 'wagmi';
import { useTxnsFromEtherscan } from './hooks/useTxnsFromEtherscan';
import Button from '@/components/ui/Button';
import { UserInput } from '@axiom-crypto/client';
import jsonInputs from "../../axiom/data/inputs_totalGas.json";
import { publicClient } from "@/lib/viemClient";
import { useAxiomCircuit } from '@axiom-crypto/react';
import { Constants } from '@/shared/constants';
import { useEffect, useMemo, useState } from 'react';
import { call } from 'viem/actions';
import { bytes32 } from "@/lib/utils";


export default function Home() {
  const { address } = useAccount();
  const [blockNumber, setBlockNumber] = useState<number>(0);
  console.log({address})
  const { status, data: txnList } = useTxnsFromEtherscan(address);

  useEffect(() => {
    const fetchBlockNumber = async () => {
      const blockNumber = await publicClient.getBlockNumber();
      setBlockNumber(Number(blockNumber));
      console.log({blockNumber})
    }
    fetchBlockNumber();
  }, [address]);

  let compiledCircuit;
  try {
    compiledCircuit = require("../../axiom/data/compiled.json");
  } catch (e) {
    console.log(e);
  }
  if (compiledCircuit === undefined) {
    return (
      <>
        <div>
          Compile circuit first by running in the root directory of this project:
        </div>
        <CodeBox>
          {"npx axiom compile circuit app/axiom/average.circuit.ts"}
        </CodeBox>
      </>
    )
  }


  console.log(status, "txnList", txnList);
  console.log("blockNumber", blockNumber);

  const {
    build,
    builtQuery,
    setParams,
    areParamsSet
  } = useAxiomCircuit<typeof jsonInputs>();

  const inputs: UserInput<typeof jsonInputs> = useMemo(() => ({
    blockNumber: Number(blockNumber),
    address: address as string,
    txnBlockNumbers: txnList.map(txn => txn.blockNumber),
    txnIndexes: txnList.map(txn => txn.transactionIndex)
  }), [blockNumber, address, txnList]);

  useEffect(() => {
    if (!address) {
      return;
    }
    setParams(inputs, Constants.CALLBACK_CONTRACT, bytes32('0x0'), address);
  }, [setParams, inputs, Constants.CALLBACK_CONTRACT, address]);

  const onButtonClick = async () => {
    if (!areParamsSet) {
      console.log("params not set");
      return;
    }
    console.log("building with inputs:", inputs)
    await build();
  }


  return (
    <>
      <Title>
        Cumulative Gas Used Proof
      </Title>
      <div className="text-center">
        Prove you have used a minimum amount of gas on Ethereum as of block.
      </div>
      <div>
        {status === 'loading' ? 
        <div> Loading... </div> :
        <div> Estimated provable gas on chain: {txnList.reduce((acc, txn) => acc + txn.gasUsed, 0)} </div>
        }
      </div>
        <Button onClick={onButtonClick}>{areParamsSet ? 'Generate proof' : 'Waiting'}</Button>
      <AdvanceStepButton
        label="Generate Proof"
        href={"/prove?" + forwardSearchParams({ 
          connected: address, 
          txnBlockNumbers: txnList.map(txn => txn.blockNumber.toString()), 
          txnIndexes: txnList.map(txn => txn.transactionIndex.toString())})}
      />
    </>
  )
}
"use client";

import Title from '@/components/ui/Title'
import { forwardSearchParams } from '@/lib/utils'
import AdvanceStepButton from '@/components/ui/AdvanceStepButton';
import CodeBox from '@/components/ui/CodeBox';
import { useAccount } from 'wagmi';
import { useTxnsFromEtherscan } from './hooks/useTxnsFromEtherscan';

export default function Home() {
  const { address } = useAccount();

  console.log({address})

  const { status, data: txnList } = useTxnsFromEtherscan(address);

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

  return (
    <>
      <Title>
        Cumulative Gas Used Proof
      </Title>
      <div className="text-center">
        Prove you have used a minimum amount of gas on Ethereum
      </div>
      <AdvanceStepButton
        label="Generate Proof"
        href={"/prove?" + forwardSearchParams({ connected: address })}
      />
    </>
  )
}
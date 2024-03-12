import BuildQuery from "@/components/prove/BuildQuery";
import Title from "@/components/ui/Title";
import callbackAbi from '@/lib/abi/GasProverNFT.json';
import jsonInputs from "../../../axiom/data/inputs_totalGas.json";
import { bytes32 } from "@/lib/utils";
import { publicClient } from "@/lib/viemClient";
import { Constants } from "@/shared/constants";
import { UserInput } from "@axiom-crypto/client";

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

interface Params {
  slug: string;
}

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default async function Prove({ searchParams }: PageProps) {
  const connected = searchParams?.connected as string ?? "";

  const blockNumber = await publicClient.getBlockNumber();
  const inputs: UserInput<typeof jsonInputs> = {
    // temporarily hardcoding these values to get the prover to work in this repo.
    blockNumber: 5472003, //Number(blockNumber), 
    address: '0x4bD047CA72fa05F0B89ad08FE5Ba5ccdC07DFFBF',
    txnBlockNumbers: [
      5466311,
      5436655, 
      5436534,
      5397055],
    txnIndexes: [99, 3, 42, 50]
  }

  return (
    <>
      <Title>
        Prove your gas Usage
      </Title>
      <div className="text-center">
        Please wait while your browser generates a compute proof for the Axiom Query.
      </div>
      <div className="flex flex-col gap-2 items-center">
        <BuildQuery
          inputs={inputs}
          callbackAddress={Constants.CALLBACK_CONTRACT}
          callbackExtraData={bytes32('0x0')}
          refundee={connected}
          callbackAbi={callbackAbi}
        />
      </div>
    </>
  )
}

import {
    add,
    sub,
    mul,
    div,
    checkLessThan,
    addToCallback,
    CircuitValue,
    CircuitValue256,
    constant,
    witness,
    getAccount,
    getReceipt,
  } from "@axiom-crypto/client";

  
  // For type safety, define the input types to your circuit here.
  // These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself.
  export interface CircuitInputs {
    address: CircuitValue;
    blockNumber: CircuitValue;
    txnBlockNumbers: CircuitValue[];
    txnIndexes: CircuitValue[];
  }
  
  // Default inputs to use for compiling the circuit. These values should be different than the inputs fed into
  // the circuit at proving time.
  export const defaultInputs = {
    "address": "0x4bD047CA72fa05F0B89ad08FE5Ba5ccdC07DFFBF",
    "blockNumber": 5436656,
    "txnBlockNumbers": [5436655, 5436534],
    "txnIndexes": [3, 42]
}
  
  // The function name `circuit` is searched for by default by our Axiom CLI; if you decide to 
  // change the function name, you'll also need to ensure that you also pass the Axiom CLI flag 
  // `-f <circuitFunctionName>` for it to work
  export const circuit = async (inputs: CircuitInputs) => {

    // TODO validate that each txn initiated by the address; maybe check msg.sender or verify signature

    // TODO verify that both txnBlockNumbers and txnIndexes are the same length
    // For each transaction, get the receipt and calculate gas used
    let txnCount = inputs.txnBlockNumbers.length;
    let totalGasUsed = constant(0);
    for (let i = 0; i< txnCount; i++) {
        const blockNumber = inputs.txnBlockNumbers[i];
        const txnIndex = inputs.txnIndexes[i];
        let receipt1 = getReceipt(blockNumber, sub(txnIndex, constant(1)));
        let cumulativeGas1 = await receipt1.cumulativeGas();

        let receipt2 = getReceipt(blockNumber, txnIndex);
        let cumulativeGas2 = await receipt2.cumulativeGas();
        let gasUsed = sub(cumulativeGas2.lo(), cumulativeGas1.lo());
        totalGasUsed = add(totalGasUsed, gasUsed);
    }

  
    // We call `addToCallback` on all values that we would like to be passed to our contract after the circuit has
    // been proven in ZK. The values can then be handled by our contract once the prover calls the callback function.
    addToCallback(inputs.address);
    addToCallback(inputs.blockNumber);
    // TODO add all the txns back into the callback?
    addToCallback(totalGasUsed);
  };
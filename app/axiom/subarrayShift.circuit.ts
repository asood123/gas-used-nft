import {
    add,
    sub,
    mul,
    div,
    checkLessThan,
    isLessThan,
    addToCallback,
    select,
    selectFromIdx,
    CircuitValue,
    CircuitValue256,
    constant,
    witness,
    getAccount,
    log,
    idxToIndicator,
    bitsToIndicator
  } from "@axiom-crypto/client";
import { constants } from "buffer";
  
//   public inputs:
// * an array `arr` of length 20
// * `start`, an index guaranteed to be in `[0, 20)`
// * `end`, an index guaranteed to be in `[0, 20)`
// * It is also known that `start <= end`

// public outputs:
// * an array `out` of length 20 such that
//   * the first `end - start` entries of `out` are the subarray `arr[start:end]`
//   * all other entries of `out` are 0.
  
  // For type safety, define the input types to your circuit here.
  // These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself.
  export interface CircuitInputs {
    arr: CircuitValue[];
    start: CircuitValue;
    end: CircuitValue;
  }
  
  // Default inputs to use for compiling the circuit. These values should be different than the inputs fed into
  // the circuit at proving time.
  export const defaultInputs = {
    "arr": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    "start": 4,
    "end": 10
  }
  
  // The function name `circuit` is searched for by default by our Axiom CLI; if you decide to 
  // change the function name, you'll also need to ensure that you also pass the Axiom CLI flag 
  // `-f <circuitFunctionName>` for it to work
  export const circuit = async (inputs: CircuitInputs) => {
  
    const numEntries = 20;
    // check length of 20 in TS
    if (inputs.arr.length !== numEntries) {
      throw new Error("Array length is not 20");
    }
    // TODO check it in the circuit?


    // check start and end between 0 and 20
    if (inputs.start.number() < 0 || inputs.start.number() >= numEntries) {
      throw new Error("Start is out of range");
    }
    if (inputs.end.number() < 0 || inputs.end.number() >= numEntries) {
      throw new Error("End is out of range");
    }
    checkLessThan(inputs.start, constant(numEntries));
    checkLessThan(inputs.end, constant(numEntries));
    checkLessThan(constant(0), add(inputs.start, 1));
    checkLessThan(constant(0), add(inputs.end, 1));
    
    // check start less than or equal to end
    if (inputs.start.value() > inputs.end.value()) {
      throw new Error("Start is greater than end");
    }
    checkLessThan(inputs.start, add(inputs.end, constant(1)));


    // add the original inputs back to the callback
    for (let i =0; i < numEntries; i++) {
        addToCallback(selectFromIdx(inputs.arr, i));
    }
    addToCallback(inputs.start);
    addToCallback(inputs.end);

    // now add the result back to the callback
    for (let i = 0; i < 20; i++) {            
        addToCallback(select(
          selectFromIdx(inputs.arr, add(inputs.start, i)),
          constant(0),
          isLessThan(constant(i), sub(inputs.end, inputs.start))
        ));
    }

  };
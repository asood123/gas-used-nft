import {
  add,
  sub,
  mul,
  div,
  checkLessThan,
  isLessThan,
  addToCallback,
  selectFromIdx,
  select,
  CircuitValue,
  CircuitValue256,
  constant,
  witness,
  getAccount,
  log
} from "@axiom-crypto/client";

// public inputs:
// * an array `arr` of length 10, each entry of which is known to be 8-bit

// public outputs:
// * the maximum of the array


// For type safety, define the input types to your circuit here.
// These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself.
export interface CircuitInputs {
  arr: CircuitValue[];
}

// Default inputs to use for compiling the circuit. These values should be different than the inputs fed into
// the circuit at proving time.
export const defaultInputs = {
  "arr": [13,5,128,4,5,3,1,34,1,30]
}

// The function name `circuit` is searched for by default by our Axiom CLI; if you decide to 
// change the function name, you'll also need to ensure that you also pass the Axiom CLI flag 
// `-f <circuitFunctionName>` for it to work
export const circuit = async (inputs: CircuitInputs) => {

  // expect 10 entries
  const entries = 10;

  // check length of 10 in TS
  if (inputs.arr.length !== entries) {
    throw new Error("Array length is not 10");
  }

  // TODO: check it in the circuit?


  // check that each entry is 8-bit, meaning 255 at most
  for (let i =0; i< entries; i++) {
    if (inputs.arr[i].value() > 255) {
      throw new Error("Entry is greater than 255");
    }
  }
  // now need to do the same check in the circuit
  for (let i =0; i< entries; i++) {
    checkLessThan(inputs.arr[i], constant(256));
  }

  let max:CircuitValue = selectFromIdx(inputs.arr, 0);
  for (let i =1; i< entries; i++) {
    max = select(selectFromIdx(inputs.arr, i), max, isLessThan(max, selectFromIdx(inputs.arr, i)));
  }

  // add the original data to the callback
  for (let i =0; i< entries; i++) {
    addToCallback(selectFromIdx(inputs.arr, i));
  }
  addToCallback(max);
};
import {
    add,
    sub,
    mul,
    div,
    checkLessThan,
    isLessThan,
    addToCallback,
    CircuitValue,
    CircuitValue256,
    constant,
    witness,
    getAccount,
  } from "@axiom-crypto/client";
  
//   public inputs:
//   * an non-negative integer x, which is known to be 16-bit
  
//   public outputs:
//   * The non-negative integer (x / 32), where "/" represents integer division.
  
  
  // For type safety, define the input types to your circuit here.
  // These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself.
  export interface CircuitInputs {
    num: CircuitValue;
  }
  
  // Default inputs to use for compiling the circuit. These values should be different than the inputs fed into
  // the circuit at proving time.
  export const defaultInputs = {
    "num": 4000,
  }
  
  // The function name `circuit` is searched for by default by our Axiom CLI; if you decide to 
  // change the function name, you'll also need to ensure that you also pass the Axiom CLI flag 
  // `-f <circuitFunctionName>` for it to work
  export const circuit = async (inputs: CircuitInputs) => {
  
    if (inputs.num.value() > 2**16-1) {
      throw new Error("Entry is greater than 2^16-1");
    }
  
    // now need to do the same check in the circuit
    checkLessThan(inputs.num, constant(256*256-1));
 
    const division:CircuitValue = div(inputs.num, constant(32));
    
    addToCallback(inputs.num);
    addToCallback(division);
  };
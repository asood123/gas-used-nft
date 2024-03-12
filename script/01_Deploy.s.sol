// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
// solhint-disable no-console

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {GasProverNFT} from "../src/GasProverNFT.sol";

// To run:
// forge script DeployScript --rpc-url $PROVIDER_URI_SEPOLIA --private-key $PRIVATE_KEY_SEPOLIA --verify -vv --skip test
// to broadcast, add --broadcast flag

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        GasProverNFT gasProverNFT = new GasProverNFT(
            vm.envAddress("AXIOM_V2_QUERY_ADDRESS_SEPOLIA"),
            11155111, // Source chain ID
            bytes32(0x12b8db9c7316de51a263e2d8077fca869604c7aae23afcae06cb1c86e2989417) // Query schema
        );
        vm.stopBroadcast();
        console.log("GasProverNFT deployed at: ", address(gasProverNFT));
    }
}
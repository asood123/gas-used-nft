// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AxiomV2Client } from "@axiom-crypto/v2-periphery/client/AxiomV2Client.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract GasProverNFT is AxiomV2Client, ERC721 {
    /// @dev The unique identifier of the circuit accepted by this contract.
    bytes32 immutable QUERY_SCHEMA;

    /// @dev The chain ID of the chain whose data the callback is expected to be called from.
    uint64 immutable SOURCE_CHAIN_ID;

    /// @dev provenGasUsed[blockNumber][address] = Gas used by account (in wei)
    mapping(uint256 => mapping(address => uint256)) public provenGasUsed;

    /// @notice Emitted when Axiom fulfills a query with query schema `QUERY_SCHEMA` and hits a callback to this contract.
    /// @param blockNumber The block number the account's average balance was calculated at.
    /// @param addr The address of the account whose average balance was calculated.
    /// @param totalGasUsed The total gas used by this account at the block number. Computing the total gas was done off-chain in a ZK proof, not in this contract.
    event GasUsedStored(uint256 blockNumber, address addr, uint256 totalGasUsed);

    /// @notice Construct a new GasProverNFT contract.
    /// @param  _axiomV2QueryAddress The address of the AxiomV2Query contract.
    /// @param  _callbackSourceChainId The ID of the chain the query reads from.
    constructor(address _axiomV2QueryAddress, uint64 _callbackSourceChainId, bytes32 _querySchema)
        AxiomV2Client(_axiomV2QueryAddress)
        ERC721("GasProverNFT", "GPNFT")
    {
        QUERY_SCHEMA = _querySchema;
        SOURCE_CHAIN_ID = _callbackSourceChainId;
    }

    /// @inheritdoc AxiomV2Client
    function _validateAxiomV2Call(
        AxiomCallbackType, // callbackType,
        uint64 sourceChainId,
        address, // caller,
        bytes32 querySchema,
        uint256, // queryId,
        bytes calldata // extraData
    ) internal view override {
        // Add your validation logic here for checking the callback responses
        require(sourceChainId == SOURCE_CHAIN_ID, "Source chain ID does not match");
        require(querySchema == QUERY_SCHEMA, "Invalid query schema");
    }

    /// @inheritdoc AxiomV2Client
    function _axiomV2Callback(
        uint64, // sourceChainId,
        address, // caller,
        bytes32, // querySchema,
        uint256, // queryId,
        bytes32[] calldata axiomResults,
        bytes calldata // extraData
    ) internal override {
        // The callback from the Axiom ZK circuit proof comes out here and we can handle the results from the
        // `axiomResults` array. Values should be converted into their original types to be used properly.
        address addr = address(uint160(uint256(axiomResults[0])));
        uint256 blockNumber = uint256(axiomResults[1]);
        uint256 totalGasUsed = uint256(axiomResults[2]);

        // You can do whatever you'd like with the results here. In this example, we just store it the value
        // directly in the contract.
        provenGasUsed[blockNumber][addr] = totalGasUsed;
        // TODO: issue an NFT to the address with gasDetails

        emit GasUsedStored(blockNumber, addr, totalGasUsed);
    }
}

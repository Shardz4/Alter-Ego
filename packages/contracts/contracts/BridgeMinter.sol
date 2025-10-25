// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./uUSD.sol";
// Wormhole verifier interface

contract BridgeMinter {
    uUSD public uUsd;
    mapping(bytes32 => bool) public processedMessages;

    modifier notProcessed(bytes32 messageId) {
        require(!processedMessages[messageId], "Processed");
        processedMessages[messageId] = true;
        _;
    }

    function mintTo(address to, uint256 amount, bytes calldata proof) external notProcessed(keccak256(proof)) {
        // Verify Wormhole proof
        uUsd.mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) external {
        // Initiate Wormhole message for withdrawal
        uUsd.burn(from, amount);
    }
}
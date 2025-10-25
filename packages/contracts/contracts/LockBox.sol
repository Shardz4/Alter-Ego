// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Import Wormhole SDK interfaces for messaging

contract LockBox {
    IERC20 public usdc; // USDC on chain

    event Locked(address indexed user, uint256 amount, bytes32 recipientOnPush);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function lock(uint256 amount, bytes32 recipientOnPush) external {
        usdc.transferFrom(msg.sender, address(this), amount);
        emit Locked(msg.sender, amount, recipientOnPush);
        // Emit Wormhole message for relayer
    }
}
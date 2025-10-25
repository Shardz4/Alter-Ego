// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./uUSD.sol";

contract UnifiedPool is ERC20, Ownable {
    uUSD public immutable uUsd;
    uint256 public constant FEE_BASIS_POINTS = 200; // 2%

    uint256 public reserveYes;
    uint256 public reserveNo;
    uint256 public invariantK;

    constructor(uUSD _uUsd) ERC20("Pool LP Shares", "uPOOL") Ownable(msg.sender) {
        uUsd = _uUsd;
    }

    function deposit(uint256 uUsdAmount, uint256 minSharesOut, address to) external returns (uint256 sharesOut) {
        uUsd.transferFrom(msg.sender, address(this), uUsdAmount);
        // Simplified: Add to reserves proportionally; calculate shares based on total supply
        sharesOut = (uUsdAmount * totalSupply()) / uUsd.balanceOf(address(this));
        require(sharesOut >= minSharesOut, "Slippage");
        _mint(to, sharesOut);
    }

    function withdraw(uint256 sharesIn, uint256 minUusdOut, address to) external returns (uint256 uUsdOut) {
        _burn(msg.sender, sharesIn);
        uUsdOut = (sharesIn * uUsd.balanceOf(address(this))) / totalSupply();
        require(uUsdOut >= minUusdOut, "Slippage");
        uUsd.transfer(to, uUsdOut);
    }

    function buyYes(uint256 uUsdIn, uint256 minYesOut, address to) external returns (uint256 yesOut) {
        uUsd.transferFrom(msg.sender, address(this), uUsdIn);
        uint256 fee = (uUsdIn * FEE_BASIS_POINTS) / 10000;
        uint256 uUsdAfterFee = uUsdIn - fee;
        // CPMM: yesOut = (uUsdAfterFee * reserveYes) / (reserveNo + uUsdAfterFee)
        yesOut = (uUsdAfterFee * reserveYes) / (reserveNo + uUsdAfterFee);
        require(yesOut >= minYesOut, "Slippage");
        reserveYes -= yesOut;
        reserveNo += uUsdAfterFee;
        // Emit/mint YES token here (integrate with Market)
        _mint(to, yesOut); // Placeholder for YES
    }

    // Symmetric functions for buyNo, sellYes, sellNo (implement similarly)
    function buyNo(uint256 uUsdIn, uint256 minNoOut, address to) external returns (uint256 noOut) {
        uUsd.transferFrom(msg.sender, address(this), uUsdIn);
        uint256 fee = (uUsdIn * FEE_BASIS_POINTS) / 10000;
        uint256 uUsdAfterFee = uUsdIn - fee;
        // CPMM: noOut = (uUsdAfterFee * reserveNo) / (reserveYes + uUsdAfterFee)
        noOut = (uUsdAfterFee * reserveNo) / (reserveYes + uUsdAfterFee);
        require(noOut >= minNoOut, "Slippage");
        reserveNo -= noOut;
        reserveYes += uUsdAfterFee;
        _mint(to, noOut); // Placeholder for NO
    }

    function sellYes(uint256 yesIn, uint256 minUusdOut, address to) external returns (uint256 uUsdOut) {
        _burn(msg.sender, yesIn);
        // Reverse CPMM: uUsdOut = (yesIn * reserveNo) / (reserveYes + yesIn)
        uUsdOut = (yesIn * reserveNo) / (reserveYes + yesIn);
        require(uUsdOut >= minUusdOut, "Slippage");
        reserveYes += yesIn;
        reserveNo -= uUsdOut;
        uUsd.transfer(to, uUsdOut);
    }

    function sellNo(uint256 noIn, uint256 minUusdOut, address to) external returns (uint256 uUsdOut) {
        _burn(msg.sender, noIn);
        // Reverse CPMM: uUsdOut = (noIn * reserveYes) / (reserveNo + noIn)
        uUsdOut = (noIn * reserveYes) / (reserveNo + noIn);
        require(uUsdOut >= minUusdOut, "Slippage");
        reserveNo += noIn;
        reserveYes -= uUsdOut;
        uUsd.transfer(to, uUsdOut);
    }
    
    function redeemWinningShares(uint256 shares, bool isYesWinner, address to) external returns (uint256 uUsdOut) {
        // 1:1 redemption for winning shares
        uUsdOut = shares;
        uUsd.transfer(to, uUsdOut);
    }

    function getPriceYes() external view returns (uint256 priceRay) {
        // Price = reserveNo / (reserveYes + reserveNo) * 1e27
        priceRay = (reserveNo * 1e27) / (reserveYes + reserveNo);
    }

    function getReserves() external view returns (uint256 uUsdBalance, uint256 yes, uint256 no) {
        uUsdBalance = uUsd.balanceOf(address(this));
        yes = reserveYes;
        no = reserveNo;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UnifiedPool.sol";

// Minimal mintable/burnable ERC20 token used for market YES/NO shares.
contract MarketToken is ERC20, Ownable {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

contract Market is Ownable {
    string public question;
    uint64 public resolveTs;
    address public oracle;
    UnifiedPool public pool;

    MarketToken public yesToken;
    MarketToken public noToken;

    bytes32 public resolvedResult; // "YES" or "NO"
    bool public settled;
    
    uint256 public totalYesShares;
    uint256 public totalNoShares;
    
    event TradeExecuted(address indexed trader, bool isYes, uint256 amount, uint256 shares);
    event MarketSettled(bytes32 result);
    event Claimed(address indexed user, uint256 amount);

    constructor(string memory _question, uint64 _resolveTs, address _oracle, address _pool) Ownable(msg.sender) {
        question = _question;
        resolveTs = _resolveTs;
        oracle = _oracle;
        pool = UnifiedPool(_pool);
        yesToken = new MarketToken("Yes Shares", "YES");
        noToken = new MarketToken("No Shares", "NO");
    }

    function buyYes(uint256 uUsdIn, uint256 minYesOut, address to) external returns (uint256 yesOut) {
        require(!settled, "Market settled");
        require(block.timestamp < resolveTs, "Market expired");
        
        yesOut = pool.buyYes(uUsdIn, minYesOut, address(this));
        require(yesOut >= minYesOut, "Slippage too high");
        
    // Mint YES tokens to user
    yesToken.mint(to, yesOut);
        totalYesShares += yesOut;
        
        emit TradeExecuted(to, true, uUsdIn, yesOut);
    }

    function buyNo(uint256 uUsdIn, uint256 minNoOut, address to) external returns (uint256 noOut) {
        require(!settled, "Market settled");
        require(block.timestamp < resolveTs, "Market expired");
        
        noOut = pool.buyNo(uUsdIn, minNoOut, address(this));
        require(noOut >= minNoOut, "Slippage too high");
        
    // Mint NO tokens to user
    noToken.mint(to, noOut);
        totalNoShares += noOut;
        
        emit TradeExecuted(to, false, uUsdIn, noOut);
    }

    function sellYes(uint256 yesIn, uint256 minUusdOut, address to) external returns (uint256 uUsdOut) {
        require(!settled, "Market settled");
        require(block.timestamp < resolveTs, "Market expired");
        
    yesToken.burn(msg.sender, yesIn);
        uUsdOut = pool.sellYes(yesIn, minUusdOut, to);
        require(uUsdOut >= minUusdOut, "Slippage too high");
        
        totalYesShares -= yesIn;
        emit TradeExecuted(to, true, uUsdOut, yesIn);
    }

    function sellNo(uint256 noIn, uint256 minUusdOut, address to) external returns (uint256 uUsdOut) {
        require(!settled, "Market settled");
        require(block.timestamp < resolveTs, "Market expired");
        
    noToken.burn(msg.sender, noIn);
        uUsdOut = pool.sellNo(noIn, minUusdOut, to);
        require(uUsdOut >= minUusdOut, "Slippage too high");
        
        totalNoShares -= noIn;
        emit TradeExecuted(to, false, uUsdOut, noIn);
    }

    function settle(bytes32 result) external {
        require(msg.sender == oracle, "Only oracle");
        require(block.timestamp >= resolveTs, "Not resolvable yet");
        require(!settled, "Already settled");
        
        resolvedResult = result;
        settled = true;
        
        emit MarketSettled(result);
    }

    function claim(address to) external returns (uint256 uUsdOut) {
        require(settled, "Not settled");
        
        bool isYesWinner = resolvedResult == keccak256("YES");
        uint256 balance = isYesWinner ? yesToken.balanceOf(to) : noToken.balanceOf(to);
        
        if (balance > 0) {
            if (isYesWinner) {
                yesToken.burn(to, balance);
            } else {
                noToken.burn(to, balance);
            }
            
            uUsdOut = pool.redeemWinningShares(balance, isYesWinner, to);
            emit Claimed(to, uUsdOut);
        }
    }

    function getMarketInfo() external view returns (
        string memory _question,
        uint64 _resolveTs,
        bool _settled,
        bytes32 _result,
        uint256 _totalYes,
        uint256 _totalNo
    ) {
        return (question, resolveTs, settled, resolvedResult, totalYesShares, totalNoShares);
    }

    function yesTokenAddress() external view returns (address) { 
        return address(yesToken); 
    }
    
    function noTokenAddress() external view returns (address) { 
        return address(noToken); 
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Market.sol";
import "./UnifiedPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MarketFactory is Ownable {
    UnifiedPool public immutable pool;
    address public immutable oracle;
    
    address[] public markets;
    mapping(address => bool) public isMarket;
    
    event MarketCreated(address indexed market, string question, uint64 resolveTs);
    event MarketRemoved(address indexed market);

    constructor(address _pool, address _oracle) Ownable(msg.sender) {
        pool = UnifiedPool(_pool);
        oracle = _oracle;
    }

    function createMarket(string calldata question, uint64 resolveTs) external returns (address market) {
        require(resolveTs > block.timestamp, "Invalid resolve time");
        require(bytes(question).length > 0, "Empty question");
        
        market = address(new Market(question, resolveTs, oracle, address(pool)));
        markets.push(market);
        isMarket[market] = true;
        
        emit MarketCreated(market, question, resolveTs);
    }
    
    function getMarkets() external view returns (address[] memory) {
        return markets;
    }
    
    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }
    
    function removeMarket(address market) external onlyOwner {
        require(isMarket[market], "Not a valid market");
        isMarket[market] = false;
        emit MarketRemoved(market);
    }
}
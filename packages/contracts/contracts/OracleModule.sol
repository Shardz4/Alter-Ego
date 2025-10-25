// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Market.sol";

contract OracleModule is Ownable {
    constructor() Ownable(msg.sender) {}
    struct OracleData {
        address oracle;
        bool isActive;
        uint256 reputation;
        uint256 totalResolutions;
        uint256 correctResolutions;
    }
    
    mapping(address => OracleData) public oracles;
    address[] public oracleList;
    
    // Market resolution tracking
    mapping(address => bytes32) public marketResolutions;
    mapping(address => bool) public resolvedMarkets;
    
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event MarketResolved(address indexed market, bytes32 result, address indexed oracle);
    event ResolutionDisputed(address indexed market, address indexed disputer);
    
    modifier onlyOracle() {
        require(oracles[msg.sender].isActive, "Not an active oracle");
        _;
    }
    
    function addOracle(address oracle) external onlyOwner {
        require(!oracles[oracle].isActive, "Oracle already active");
        oracles[oracle] = OracleData({
            oracle: oracle,
            isActive: true,
            reputation: 1000, // Starting reputation
            totalResolutions: 0,
            correctResolutions: 0
        });
        oracleList.push(oracle);
        emit OracleAdded(oracle);
    }
    
    function removeOracle(address oracle) external onlyOwner {
        require(oracles[oracle].isActive, "Oracle not active");
        oracles[oracle].isActive = false;
        emit OracleRemoved(oracle);
    }
    
    function resolveMarket(address market, bytes32 result) external onlyOracle {
        require(!resolvedMarkets[market], "Market already resolved");
        
        Market marketContract = Market(market);
        require(block.timestamp >= marketContract.resolveTs(), "Not resolvable yet");
        
        marketResolutions[market] = result;
        resolvedMarkets[market] = true;
        
        // Update oracle stats
        oracles[msg.sender].totalResolutions++;
        
        // Call market's settle function
        marketContract.settle(result);
        
        emit MarketResolved(market, result, msg.sender);
    }
    
    function disputeResolution(address market) external {
        require(resolvedMarkets[market], "Market not resolved");
        // Implement dispute mechanism
        emit ResolutionDisputed(market, msg.sender);
    }
    
    function getOracleReputation(address oracle) external view returns (uint256) {
        return oracles[oracle].reputation;
    }
    
    function getOracleAccuracy(address oracle) external view returns (uint256) {
        OracleData memory data = oracles[oracle];
        if (data.totalResolutions == 0) return 0;
        return (data.correctResolutions * 100) / data.totalResolutions;
    }
    
    function getActiveOracles() external view returns (address[] memory) {
        address[] memory activeOracles = new address[](oracleList.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < oracleList.length; i++) {
            if (oracles[oracleList[i]].isActive) {
                activeOracles[count] = oracleList[i];
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(activeOracles, count)
        }
        
        return activeOracles;
    }
    
    function isMarketResolved(address market) external view returns (bool) {
        return resolvedMarkets[market];
    }
    
    function getMarketResolution(address market) external view returns (bytes32) {
        return marketResolutions[market];
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./MarketFactory.sol";
import "./OracleModule.sol";

contract Governance is Ownable {
    struct Proposal {
        uint256 id;
        string description;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bytes callData;
        address target;
    }
    
    ERC20 public governanceToken;
    MarketFactory public marketFactory;
    OracleModule public oracleModule;
    
    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    uint256 public quorumThreshold = 1000; // Minimum tokens required to vote
    uint256 public proposalThreshold = 10000; // Minimum tokens to create proposal
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(address => uint256) public votingPower;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    
    modifier onlyTokenHolder() {
        require(governanceToken.balanceOf(msg.sender) >= proposalThreshold, "Insufficient tokens");
        _;
    }
    
    constructor(
        address _governanceToken,
        address _marketFactory,
        address _oracleModule
    ) Ownable(msg.sender) {
        governanceToken = ERC20(_governanceToken);
        marketFactory = MarketFactory(_marketFactory);
        oracleModule = OracleModule(_oracleModule);
    }
    
    function createProposal(
        string memory description,
        address target,
        bytes memory callData
    ) external onlyTokenHolder returns (uint256) {
        require(governanceToken.balanceOf(msg.sender) >= proposalThreshold, "Insufficient voting power");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            description: description,
            proposer: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            callData: callData,
            target: target
        });
        
        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!hasVoted[msg.sender][proposalId], "Already voted");
        require(governanceToken.balanceOf(msg.sender) >= quorumThreshold, "Insufficient voting power");
        
        uint256 votes = governanceToken.balanceOf(msg.sender);
        hasVoted[msg.sender][proposalId] = true;
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        emit VoteCast(msg.sender, proposalId, support, votes);
    }
    
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        
        // Execute the proposal
        (bool success, ) = proposal.target.call(proposal.callData);
        require(success, "Proposal execution failed");
        
        emit ProposalExecuted(proposalId);
    }
    
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    function getProposalState(uint256 proposalId) external view returns (string memory) {
        Proposal memory proposal = proposals[proposalId];
        
        if (block.timestamp < proposal.startTime) {
            return "Pending";
        } else if (block.timestamp <= proposal.endTime) {
            return "Active";
        } else if (proposal.executed) {
            return "Executed";
        } else if (proposal.forVotes <= proposal.againstVotes) {
            return "Defeated";
        } else {
            return "Succeeded";
        }
    }
    
    function setVotingPeriod(uint256 newPeriod) external onlyOwner {
        votingPeriod = newPeriod;
    }
    
    function setQuorumThreshold(uint256 newThreshold) external onlyOwner {
        quorumThreshold = newThreshold;
    }
    
    function setProposalThreshold(uint256 newThreshold) external onlyOwner {
        proposalThreshold = newThreshold;
    }
}

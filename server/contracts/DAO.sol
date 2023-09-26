//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DAO is ERC20
{
    enum VotingStatus
    {
        notStarted, 
        live,
        ended
    }

    address public manager;

    struct Proposals
    {
        string proposal; 
        address proposer;
        uint threshold;
        VotingStatus votingStatus;
        uint resultCount;
        bool result;
    }

    //cost of 1 vote=50 DAO
    //1 ether=100 DAO tokens
    uint public tokensPerEther=100; 

    uint public pollId;

    mapping(uint=>Proposals) public proposals;

    //users[pollId]=votes cast 
    //stores how many votes were cast by a user for any particular poll 
    mapping(address=>mapping(uint=>uint)) public votesCast;

    modifier onlyManager
    {
        require(msg.sender==manager,"Only the manager can call");
        _;
    }

    event newProposalDetails
    (
        uint pollId,
        string proposal, 
        address proposer
    );

    event thresholdSet
    (
        uint pollId,
        uint threshold
    );

    event tokensPurchased
    (
        uint tokensPurchased 
    );

    constructor() ERC20("DecentralizedAutonomousOrganization","DAO")
    {
        manager=msg.sender; 
    } 
    
    function newProposal(string memory proposal) public returns(uint)
    {
        pollId++;
        proposals[pollId]=Proposals
        (
            proposal,
            msg.sender,
            0,
            VotingStatus.notStarted,
            0,
            false
        );
        emit newProposalDetails
        (
            pollId,
            proposal,
            msg.sender
        );
        return pollId;
    }

    function setThreshold(uint _pollId,uint threshold) public onlyManager 
    {
        proposals[_pollId].threshold=threshold; 
        emit thresholdSet
        (
            _pollId,
             threshold
        );
    }

    //tokens should be bought in multiples of 100 for simplicity 
    function checkTokensCostInEther(uint tokens) public view returns(uint)
    {
        return tokens/tokensPerEther; 
    }

    function purchaseDAOtokens(uint tokens) public payable 
    {
        _mint(msg.sender, tokens);
        emit tokensPurchased
        (
            tokens
        );
    }

    function checkDAOtokenBalance() public view returns(uint)
    {
        return balanceOf(msg.sender);
    }

    function checkVoteCost(uint _pollId) public view returns(uint)
    {
        return (((votesCast[msg.sender][_pollId])+1)**2)*50;
    }
}
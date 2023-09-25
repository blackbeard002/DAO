//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

contract DAO
{
    address public manager;
    struct Proposals
    {
        string proposal; 
        address proposer;
        uint threshold;
        uint result;
        bool voting;
    }

    uint public proposalId;
    mapping(uint=>Proposals) public proposals;

    constructor()
    {
        manager=msg.sender; 
    } 
    
    function newProposal(string memory proposal) public 
    {
        
    }
}
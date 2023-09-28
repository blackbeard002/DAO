//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0; 

import {DAO} from "../contracts/DAO.sol";
import {Test} from "forge-std/Test.sol";
import "forge-std/console.sol";

contract DAOTest
{
    DAO public dao;

    function setUo() public
    {
        dao=new DAO();
    }

    function test_manager() public view
    {
        //console.logAddress(dao.manager());
        uint a;
        a=dao.pollId();
        console.logUint(a);
    }
}   
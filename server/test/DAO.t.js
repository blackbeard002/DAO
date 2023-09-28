const { ethers } = require("hardhat");

  describe("DAO",()=>{

    let dao;
    let accounts;
    beforeEach(async ()=>{
      accounts=await ethers.getSigners();
      const DAO=await ethers.getContractFactory("DAO");
      dao=await DAO.deploy();
    });

    describe("Debugging",()=>{

      it("Debugging vote()",async()=>{
        await dao.connect(accounts[1]).purchaseDAOtokens(500,{value:ethers.parseEther("5")});
        await dao.connect(accounts[2]).purchaseDAOtokens(2800,{value:ethers.parseEther("28")});
        await dao.connect(accounts[1]).newProposal("who's the GOAT?",["Messi","R10","cr7"]);
        await dao.changeVotingState(1,1);
        console.log("Balacnce before voting"+await dao.connect(accounts[2]).checkDAOtokenBalance());
        //await dao.connect(accounts[2]).vote(1,0);
        await dao.connect(accounts[2]).vote(1,2);
        await dao.connect(accounts[2]).vote(1,2);
        await dao.connect(accounts[2]).vote(1,2);
        await dao.connect(accounts[2]).vote(1,2);
        //await dao.connect(accounts[2]).vote(1,1);
        console.log("Balacnce before voting"+await dao.connect(accounts[2]).checkDAOtokenBalance());
        console.log(await dao.checkLiveVoteCount(1));
      });
    });
  });
const { ethers } = require("hardhat");
const {expect}= require("chai");

  describe("DAO",()=>{

    let dao;
    let accounts;
    beforeEach(async ()=>{
      accounts=await ethers.getSigners();
      const DAO=await ethers.getContractFactory("DAO");
      dao=await DAO.deploy();
    });

    describe("1:CHECK ALL THE REVERTS",()=>{

      it("newProposal()",async()=>{
        await expect(dao.newProposal("who's the GOAT?",["Messi","R10","cr7"])).to.be.revertedWith("insufficient DAO");
      });

      it("changeVotingState()",async()=>{
        await expect(dao.connect(accounts[1]).changeVotingState(1,1)).to.be.revertedWith("Only the manager can call");
      });

      it("vote()",async()=>{
        await expect(dao.vote(5,0)).to.be.revertedWith("invalid poll ID");
        await dao.connect(accounts[1]).purchaseDAOtokens({value:ethers.parseEther("5")});
        await dao.connect(accounts[1]).newProposal("who's the GOAT?",["Messi","R10","cr7"]);
        await expect(dao.connect(accounts[5]).delegateVote(1,0,accounts[4].address)).to.be.revertedWith("you aren't a delegator");
        await expect(dao.connect(accounts[5]).checkDelegatorsBalance(accounts[4].address)).to.be.revertedWith("you aren't a delegator");
        await expect(dao.connect(accounts[1]).vote(1,0)).to.be.revertedWith("you can't vote on your own poll");
        await expect(dao.connect(accounts[2]).vote(1,0)).to.be.revertedWith("Threshold isn't set yet");
        await dao.setThreshold(1,3);
        await expect(dao.connect(accounts[2]).vote(1,0)).to.be.revertedWith("Voting isn't in progress");
        await expect(dao.checkLiveVoteCount(1)).to.be.revertedWith("voting isn't in progress");
        await dao.changeVotingState(1,1);
        await expect(dao.connect(accounts[2]).vote(1,0)).to.be.revertedWith("insufficient DAO");
        //checkFinalResult
        await expect(dao.checkFinalResult(1)).to.be.revertedWith("voting hasn't completed yet");
      });

      it("stake()",async()=>{
        await expect(dao.stake(500)).to.be.revertedWith("insufficient DAO");
      });

      it("claim()",async()=>{
        await expect(dao.claim()).to.be.revertedWith("no tokens staked.nothing to claim");
      });

      it("unStake()",async()=>{
        await expect(dao.unStake(500)).to.be.revertedWith("less tokens are staked");
      });
    });

    describe("2:ADD PROPOSALS AND VOTE",()=>{
      it("vote and win",async()=>{
        await dao.connect(accounts[1]).purchaseDAOtokens({value:ethers.parseEther("5")});
        await dao.connect(accounts[2]).purchaseDAOtokens({value:ethers.parseEther("28")});
        await dao.connect(accounts[3]).purchaseDAOtokens({value:ethers.parseEther("28")});
        await dao.connect(accounts[4]).purchaseDAOtokens({value:ethers.parseEther("28")});
        await dao.connect(accounts[1]).newProposal("who's the GOAT?",["Messi","R10","cr7"]);
        await dao.connect(accounts[1]).newProposal("what's your fav?",["Biriyani","Kebabs","Pizza"]);
        await dao.changeVotingState(1,1);
        await dao.changeVotingState(1,2);
        await dao.setThreshold(1,3);
        await dao.setThreshold(2,3);
        await dao.connect(accounts[3]).vote(1,1);
        await dao.connect(accounts[4]).vote(1,1);
        const voteCount=await dao.checkLiveVoteCount(1);
        await expect(voteCount[0]).to.be.equal(2);
        await expect(voteCount[1]).to.be.equal("R10");
        await dao.connect(accounts[2]).vote(1,0);
        await dao.connect(accounts[2]).vote(1,0);
        await dao.connect(accounts[2]).vote(1,0);
        await dao.connect(accounts[2]).vote(1,0);
        await dao.connect(accounts[4]).delegation(accounts[6].address); 
        await expect(await dao.connect(accounts[6]).checkDelegatorsBalance(accounts[4].address)).to.be.equal(await dao.connect(accounts[4]).checkDAOtokenBalance());
        await dao.connect(accounts[6]).delegateVote(1,0,accounts[4].address);
        const voteCount2=await dao.checkLiveVoteCount(1);
        await expect(voteCount2[0]).to.be.equal(5);
        await expect(voteCount2[1]).to.be.equal("Messi");
        await dao.connect(accounts[4]).vote(2,1);
        await dao.changeVotingState(2,1);
        await dao.changeVotingState(2,2);
        await expect(await dao.checkFinalResult(1)).to.be.equal("Messi");
        await expect(await dao.checkPollResult(1)).to.be.equal(true);
        await expect(await dao.checkPollResult(2)).to.be.equal(false);

        //transferEthToManager()
        const beforeBalance=await dao.checkManagerEthBalance();
        await dao.transferEthToManager();
        const afterBalance=await dao.checkManagerEthBalance();
        expect(afterBalance).to.be.greaterThan(beforeBalance);
      });
    });

    describe("3:STAKING",()=>{
      it("staking and unstaking",async()=>{
        await dao.purchaseDAOtokens({value:ethers.parseEther("10")});
        await dao.stake(1000); 
        //await new Promise(resolve => setTimeout(resolve, 1 * 1000));
        const beforeBalance=await dao.checkDAOtokenBalance();
        await dao.claim();
        const afterBalance=await dao.checkDAOtokenBalance();
        await expect(afterBalance).to.be.equal(1020);
        await dao.unStake(1000);
        const finalBalance=await dao.checkDAOtokenBalance();
        await expect(finalBalance).to.be.equal(1020);
      });
    });
  });
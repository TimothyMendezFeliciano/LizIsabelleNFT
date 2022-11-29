import {time, loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {anyValue} from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {expect} from "chai";
import {ethers} from "hardhat";
import {BigNumber} from "ethers";

const fakeURI = "fakeURI";

describe("LizIsabelleNFT", function () {

    async function deployTokenFixture() {
        const [owner, buyerAccount, donationRecipient] = await ethers.getSigners();

        const LizIsabelleNFT = await ethers.getContractFactory("LizIsabelleNFT");

        const lizNFTContract = await LizIsabelleNFT.deploy(fakeURI, donationRecipient.address);
        await lizNFTContract.deployed();

        return {lizNFTContract, owner, buyerAccount, donationRecipient};
    }

    it("Deployment should assign one NFT token to deployer", async () => {
        const {lizNFTContract, owner} = await loadFixture(deployTokenFixture)
        const ownerBalance = await lizNFTContract.balanceOf(owner.address);
        expect(ownerBalance).to.equal(BigNumber.from("1"))
    })

    it("Buyer should be able to mint token", async () => {
        const {lizNFTContract, owner, buyerAccount, donationRecipient} = await loadFixture(deployTokenFixture)

        const mintTransaction = await lizNFTContract.connect(buyerAccount).mint({
            value: ethers.utils.parseEther("0.000001"),
        })
        await mintTransaction.wait(1);
        const buyerBalance = await lizNFTContract.balanceOf(buyerAccount.address);
        expect(buyerBalance).to.equal(BigNumber.from("1"))
    })

    it("Owner should have received donation", async () => {
        const {lizNFTContract, owner, buyerAccount} = await loadFixture(deployTokenFixture)
        const previousBalance = await owner.getBalance();
        const mintTransaction = await lizNFTContract.connect(buyerAccount).mint({
            value: ethers.utils.parseEther("0.000001")
        })
        await mintTransaction.wait(1);
        const currentBalance = await owner.getBalance();
        expect(currentBalance).to.be.greaterThan(previousBalance)
    })

    it("Donation Recipient should have received donation", async () => {
        const {lizNFTContract, owner, buyerAccount, donationRecipient} = await loadFixture(deployTokenFixture)
        const previousBalance = await donationRecipient.getBalance()
        const mintTransaction = await lizNFTContract.connect(buyerAccount).mint({
            value: ethers.utils.parseEther("0.000001")
        })
        await mintTransaction.wait(1);
        const currentBalance = await donationRecipient.getBalance()
        expect(currentBalance).to.be.greaterThan(previousBalance)
    })

})

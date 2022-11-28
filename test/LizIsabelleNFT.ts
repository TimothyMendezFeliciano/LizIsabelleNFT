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

})

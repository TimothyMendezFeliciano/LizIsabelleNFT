pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract LizIsabelleNFT is ERC721Royalty, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter private _tokenIds;

    string _baseTokenURI;
    uint256 public _price = 0.000001 ether;
    uint256 public basisPoints = 1000; // parts per 10,000
    uint256 public totalTokenIdsMinted;
    address public donationRecipientAddress;

    event DonationRecipientChanged(address oldAddress, address newAddress);

    constructor(string memory baseURI, address memory donationRecipient) ERC721("LizIsabelleNFT", "LINFT") {
        _baseTokenURI = baseURI;
        _setDefaultRoyalty(msg.sender, basisPoints);
        donationRecipientAddress = donationRecipient;
        _tokenIds.increment();
        _mint(msg.sender, _tokenIds.current());
    }

    function mint() public payable {
        require(msg.value >= _price, "Not enough ether sent");
        address owner = owner();
        // Only use the price
        uint256 price = msg.value - (msg.value - _price);
        // Calculate 10% of _price
        // Send 10% to owner and 90% to donationRecipientAddress
        (bool sent,) = owner.call{value : price - price.div(10)}("");
        require(sent, "Failed to Send Ether to Owner");
        (bool sent,) = donationRecipientAddress.call{value : price - (price.div(10).mul(9))}("");
        require(sent, "Failed to send Ether to donationRecipient");
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
    }

    function changeDonationRecipient(address memory _newDonationRecipient) public onlyOwner {
        address oldAddress = donationRecipientAddress;
        donationRecipientAddress = _newDonationRecipient;
        emit DonationRecipientChanged(oldAddress, _newDonationRecipient);
    }

    function _burn(uint256 tokenId) internal virtual override {
        require(msg.sender == ownerOf(tokenId), "Cannot burn. Not token owner.");
        super._burn(tokenId);
        _resetTokenRoyalty(tokenId);
    }

    function burnNFT(uint256 tokenId) public {
        _burn(tokenId);
    }

    receive() external payable {}

    fallback() external payable {}
}

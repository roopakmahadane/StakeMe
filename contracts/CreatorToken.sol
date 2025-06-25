// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

using MessageHashUtils for bytes32;

contract CreatorToken is ERC20, Ownable {
    address public backendSigner;
    uint256 public constant MAX_PER_TX = 25;
    uint256 public constant MAX_PER_DAY = 50;

    mapping(address => mapping(uint256 => uint256)) public dailyMinted;

    event TokenPurchased(
  address indexed buyer,
  uint256 amount,
  uint256 pricePerToken,
  uint256 timestamp
);

    constructor(
        address _owner,
        address _backendSigner,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(_owner) {
        backendSigner = _backendSigner;
    }

    function getDayNumber(uint256 timestamp) internal pure returns (uint256) {
    return timestamp / 1 days;
}

    function mintWithSignature(
        uint256 amount,
        uint256 pricePerToken,
        uint256 expiry,
        bytes calldata signature
    ) external payable {
        require(block.timestamp <= expiry, "Signature expired");
        require(msg.value >= amount * pricePerToken, "Insufficient payment");
        require(amount <= MAX_PER_TX, "Exceeds per transaction limit");
        

        uint256 today = getDayNumber(block.timestamp);
        uint256 alreadyMinted = dailyMinted[msg.sender][today];

        require(alreadyMinted + amount <= MAX_PER_DAY, "Exceeds daily mint limit");

        bytes32 messageHash = keccak256(
            abi.encodePacked(address(this), msg.sender, amount, pricePerToken, expiry)
        );

        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash(); // ✅ works with MessageHashUtils

        require(
            ECDSA.recover(ethSignedMessageHash, signature) == backendSigner,
            "Invalid signature"
        );
        dailyMinted[msg.sender][today] += amount;
        _mint(msg.sender, amount * 10 ** decimals());

        
        payable(owner()).transfer(msg.value);
        emit TokenPurchased(msg.sender, amount, pricePerToken, block.timestamp);
    }
    
    function getRemainingMintsToday(address user) external view returns (uint256) {
    uint256 today = getDayNumber(block.timestamp);
    return 50 - dailyMinted[user][today];
}
}

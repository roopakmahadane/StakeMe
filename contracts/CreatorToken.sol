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

    constructor(
        address _owner,
        address _backendSigner,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(_owner) {
        backendSigner = _backendSigner;
    }

    function mintWithSignature(
        uint256 amount,
        uint256 pricePerToken,
        uint256 expiry,
        bytes calldata signature
    ) external payable {
        require(block.timestamp <= expiry, "Signature expired");
        require(msg.value >= amount * pricePerToken, "Insufficient payment");

        bytes32 messageHash = keccak256(
            abi.encodePacked(address(this), msg.sender, amount, pricePerToken, expiry)
        );

        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash(); // ✅ works with MessageHashUtils

        require(
            ECDSA.recover(ethSignedMessageHash, signature) == backendSigner,
            "Invalid signature"
        );

        _mint(msg.sender, amount * 10 ** decimals());
        payable(owner()).transfer(msg.value);
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import './CreatorToken.sol';
import 'hardhat/console.sol';

contract CreatorFactory {
    address[] public creatorTokens; 
    uint public constant MAX_TOKENS_PER_USER = 1;
    address public backendSigner;

    struct TokenData {
        address tokenAddress;
        string name;
        string symbol;
    }

    mapping(address => address[]) tokenByCreator;
    mapping(address => TokenData) public tokenMetadata;
    mapping(string => bool) private usedNames;
    mapping(string => bool) private usedSymbols;

    event tokenDeployed(address indexed creator, address indexed tokenAddress, string name, string symbol);

    constructor(address _backendSigner) {
        backendSigner = _backendSigner;
    }

    function createToken(string memory _name, string memory _symbol) external {
        require(bytes(_name).length > 0, "Token name cannot be empty");
        require(bytes(_symbol).length > 0, "Token symbol cannot be empty");
        require(tokenByCreator[msg.sender].length < MAX_TOKENS_PER_USER, "Token creation limit reached");
        require(!usedNames[_name], "Token name already used");
        require(!usedSymbols[_symbol], "Token symbol already used");

        CreatorToken newToken = new CreatorToken(msg.sender, backendSigner, _name, _symbol);
        address tokenAddress = address(newToken);

        usedNames[_name] = true;
        usedSymbols[_symbol] = true;
        creatorTokens.push(tokenAddress);
        tokenByCreator[msg.sender].push(tokenAddress);
        tokenMetadata[tokenAddress] = TokenData(tokenAddress, _name, _symbol);

        emit tokenDeployed(msg.sender, tokenAddress, _name, _symbol);
    }

    function allTokens() public view returns (address[] memory) {
        return creatorTokens;
    }

    function getTokensByCreator(address creator) public view returns (TokenData[] memory) {
        address[] memory tokens = tokenByCreator[creator];
        TokenData[] memory allTokenData = new TokenData[](tokens.length);
        for (uint i = 0; i < tokens.length; i++) {
            allTokenData[i] = tokenMetadata[tokens[i]];
        }
        return allTokenData;
    }
}
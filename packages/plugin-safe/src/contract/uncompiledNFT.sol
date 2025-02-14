// deployed at 0x7a13aeeB48be6b60ee45972F88A81fB48466e7Db
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTContractName is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public maxSupply;
    uint256 public currentTokenId;
    uint256 public royalty;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _royalty,
        string memory baseURI,
        address initialOwner
    ) ERC721(_name, _symbol) Ownable(initialOwner) {
        maxSupply = _maxSupply;
        royalty = _royalty;
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Allows the owner to mint a token to a specified address
     */
    function mint(address to) public onlyOwner {
        require(currentTokenId < maxSupply, "Max supply reached");
        currentTokenId++;
        _safeMint(to, currentTokenId);
    }

    /**
     * @dev Allows the owner to batch mint tokens to a specified address
     */
    function batchMint(address to, uint256 quantity) public onlyOwner {
        require(currentTokenId + quantity <= maxSupply, "Would exceed max supply");
        
        for(uint256 i = 0; i < quantity; i++) {
            currentTokenId++;
            _safeMint(to, currentTokenId);
        }
    }

    /**
     * @dev Base URI for computing {tokenURI}
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Sets the base URI for metadata
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    /**
     * @dev Sets a specific tokenURI for a token ID
     */
    function setTokenURI(uint256 tokenId, string memory _tokenURI) public onlyOwner {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @dev Checks if a token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    /**
     * @dev See {IERC2981-royaltyInfo}
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        require(_exists(_tokenId), "Nonexistent token");
        return (owner(), (_salePrice * royalty) / 10000);
    }
}
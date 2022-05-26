// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract GemsCollection is ERC721Enumerable, ERC2981, Ownable, PaymentSplitter {
    using SafeMath for uint256;
    using Strings for uint256;

    enum Sale {
        NoSale,
        PublicSale
    }

    uint256 public constant MAX_TOKENS = 3333;

    string public baseURI = "";

    Sale public state = Sale.NoSale;

    event Minted(uint256 balance, address owner);

    string public contractURI =
        "https://ipfs.io/ipfs/QmXzTCRDiyj4D8ApmJLYibk8YAtH142gFBfS9WEV5SD7zx";

    uint256[] private _teamShares = [75, 25];

    address[] private _team = [
        0xA4Ad17ef801Fa4bD44b758E5Ae8B2169f59B666F, //This one gets 75%
        0x5A0269e2dE34A0c26db97FD14830f387e35dfBD6 //This one gets 25%
    ];

    bytes32 private presaleRoot;

    constructor()
        ERC721("The Past Gems", "GEMS")
        PaymentSplitter(_team, _teamShares)
    {
        _setDefaultRoyalty(address(_team[0]), 750);
        // _transferOwnership(address(_team[0]));
        baseURI = "ipfs://QmXx3kk8hny76aeSQTERNVUoSzgUWHg4NTeM7Sp695mG3N/";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function enable() public onlyOwner {
        state = Sale.PublicSale;
    }

    function disable() public onlyOwner {
        state = Sale.NoSale;
    }

    function saleIsActive() public view returns (bool) {
        return state == Sale.PublicSale;
    }

    function exists(uint256 id) public view returns (bool) {
        return _exists(id);
    }

    function mint(uint256[] calldata ids) external onlyOwner {
        require(
            totalSupply().add(ids.length) <= MAX_TOKENS,
            "Purchase would exceed max supply of tokens."
        );
        for (uint256 i = 0; i < ids.length; i++) {
            _safeMint(_msgSender(), ids[i]);
        }
        emit Minted(ids.length, _msgSender());
    }

    function mintForAddress(
        uint256[] calldata ids,
        address[] calldata addresses
    ) external onlyOwner {
        require(
            totalSupply() + ids.length <= MAX_TOKENS,
            "Purchase would exceed max supply of tokens."
        );
        for (uint256 i = 0; i < ids.length; i++) {
            _safeMint(addresses[i], ids[i]);
        }
    }

    /**
     * @dev See {IERC165-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "nonexistent token");
        string memory uri = _baseURI();

        if (bytes(uri).length == 0) {
            return "";
        }
        return string(abi.encodePacked(uri, tokenId.toString(), ".json"));
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev will set default royalty info.
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        public
        onlyOwner
    {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @dev will set token royalty.
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) public onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    function setContractURI(string calldata _contractURI) public onlyOwner {
        contractURI = _contractURI;
    }

    receive() external payable override {}
}

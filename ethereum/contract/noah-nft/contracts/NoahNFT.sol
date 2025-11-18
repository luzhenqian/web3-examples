// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC721.sol";
import "./IERC165.sol";

contract NoahNFT is IERC721, IERC721Metadata, IERC165 {
    mapping(address => uint256) public balances; // 账本  NFT 持有者 =>  NFT 数量
    mapping(uint256 => address) public owners; // 账本  NFT id =>  NFT 持有者
    mapping(uint256 => address) public tokenApprovals; // 授权账本 NFT id =>  NFT 授权者
    mapping(address => mapping(address => bool)) public operatorApprovals; // 授权所有 NFT 的账本  NFT 持有者 => 被授权者 => 是否授权
    address public owner; // 合约所有者
    string private _name; //  NFT 名称
    string private _symbol; //  NFT 符号
    string private _baseURI; //  NFT 的基础 MetadataURI
    mapping(uint256 => string) private _tokenURIs; //  NFT 元数据  NFT id => 元数据
    uint256 public totalSupply = 0; // 当前 NFT id，同时也是 NFT 总数

    // 构造函数
    constructor(
        string memory initName,
        string memory initSymbol,
        string memory baseURI
    ) {
        owner = msg.sender;
        _name = initName;
        _symbol = initSymbol;
        _baseURI = baseURI;
    }

    // 检查合约是否实现了某个接口
    function supportsInterface(bytes4 interfaceId)
        public
        pure
        override
        returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

    // 查询 NFT 名称
    function name() public view override returns (string memory) {
        return _name;
    }

    // 查询 NFT 符号
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    // 设置 NFT 的基础 MetadataURI
    function setBaseURI(string memory baseURI) public {
        require(msg.sender == owner, "only owner can set baseURI");
        _baseURI = baseURI;
    }

    // 查询 NFT 的 MetadataURI
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return
            bytes(_baseURI).length > 0
                ? string(abi.encodePacked(_baseURI, _tokenURIs[tokenId]))
                : "";
    }

    // 检查某个 NFT 是否存在
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return owners[tokenId] != address(0);
    }

    // 查询某个地址的 NFT 数量
    function balanceOf(address _owner) public view override returns (uint256) {
        //  NFT 持有者地址不能为0
        require(
            _owner != address(0),
            "ERC721: balance query for the zero address"
        );
        return balances[_owner];
    }

    // 查询某个 NFT 的持有者
    function ownerOf(uint256 tokenId) public view override returns (address) {
        return _ownerOf(tokenId);
    }

    // 查询某个 NFT 的持有者 内部函数
    function _ownerOf(uint256 tokenId) internal view returns (address) {
        address tokenOwner = owners[tokenId];
        //  NFT 持有者地址不能为0
        require(
            tokenOwner != address(0),
            "ERC721: owner query for nonexistent token"
        );
        return tokenOwner;
    }

    // 授权单个 NFT
    function approve(address to, uint256 tokenId) public override {
        address tokenOwner = owners[tokenId]; //  NFT 持有者
        // 发送者必须是 NFT 持有者或者 NFT 持有者已经将所有 NFT 授权给发送者
        require(
            msg.sender == tokenOwner ||
                isApprovedForAll(tokenOwner, msg.sender),
            "ERC721: approve caller is not owner nor approved for all"
        );
        // NFT 持有者不能将 NFT 授权给自己
        require(
            tokenOwner == msg.sender,
            "ERC721: approve caller is not owner nor approved for all"
        );
        // 被授权地址不能为0
        require(to != address(0), "ERC721: approve to the zero address");
        // 授权者与被授权者不能为同一地址
        require(tokenOwner != to, "ERC721: approve to caller");
        // 授权者已经将所有 NFT 授权给被授权者
        require(
            !isApprovedForAll(tokenOwner, to),
            "ERC721: approve caller is not owner nor approved for all"
        );
        // 将 NFT 授权给被授权者
        tokenApprovals[tokenId] = to;
        // 触发授权事件
        emit Approval(tokenOwner, to, tokenId);
    }

    // 查询某个 NFT 的授权者
    function getApproved(uint256 tokenId)
        public
        view
        override
        returns (address)
    {
        address tokenOwner = owners[tokenId]; //  NFT 持有者
        //  NFT 持有者地址不能为0
        require(
            tokenOwner != address(0),
            "ERC721: approved query for nonexistent token"
        );
        return tokenApprovals[tokenId];
    }

    // 授权或撤销所有 NFT
    function setApprovalForAll(address operator, bool approved)
        public
        override
    {
        // 被授权者地址不能为0
        require(operator != address(0), "ERC721: approve to the zero address");
        // 被授权者与发送者不能为同一地址
        require(operator != msg.sender, "ERC721: approve to caller");
        // 将所有 NFT 授权给被授权者
        operatorApprovals[msg.sender][operator] = approved;
        // 触发授权所有 NFT 事件
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    // 查询某个 NFT 持有者是否将所有 NFT 授权给某个地址
    function isApprovedForAll(address _owner, address operator)
        public
        view
        override
        returns (bool)
    {
        //  NFT 持有者地址不能为0
        require(
            _owner != address(0),
            "ERC721: operator query for nonexistent token"
        );
        // 被授权者地址不能为0
        require(
            operator != address(0),
            "ERC721: operator query for nonexistent token"
        );
        return operatorApprovals[_owner][operator];
    }

    // 转移 NFT
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        _transfer(from, to, tokenId);
    }

    // 转移 NFT
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        address tokenOwner = owners[tokenId]; //  NFT 持有者
        // from 必须是 NFT 持有者
        require(
            tokenOwner == from,
            "ERC721: transfer of token that is not own"
        );
        // 被授权者地址不能为0
        require(to != address(0), "ERC721: transfer to the zero address");
        // 合约调用者必须是 NFT 持有者或者 NFT 持有者已经将所有 NFT 授权给合约调用者或者 NFT 持有者已经将该 NFT 授权给合约调用者
        require(
            tokenOwner == msg.sender ||
                isApprovedForAll(tokenOwner, msg.sender) ||
                tokenApprovals[tokenId] == msg.sender,
            "ERC721: transfer caller is not owner nor approved for all"
        );
        // 撤销 NFT 授权
        _clearApproval(tokenId);
        // 同步 NFT 持有者持币数量
        _removeTokenFrom(from, tokenId);
        // 转移 NFT
        _addTokenTo(to, tokenId);
        // 触发转移 NFT 事件
        emit Transfer(from, to, tokenId);
    }

    // 撤销 NFT 授权
    function _clearApproval(uint256 tokenId) internal {
        // 撤销 NFT 授权
        if (tokenApprovals[tokenId] != address(0)) {
            delete tokenApprovals[tokenId];
        }
    }

    // 同步 NFT 持有者持币数量
    function _removeTokenFrom(address from, uint256 tokenId) internal {
        //  NFT 持有者持币数量减一
        balances[from] -= 1;
        // 从 NFT 持有者持币列表中删除该 NFT
        delete owners[tokenId];
    }

    // 转移 NFT
    function _addTokenTo(address to, uint256 tokenId) internal {
        //  NFT 持有者持币数量加一
        balances[to] += 1;
        // 将 NFT 添加到 NFT 持有者持币列表中
        owners[tokenId] = to;
    }

    // 检查被授权者是否接收 NFT
    function _checkOnERC721Received(
        address from,
        address to,
        bytes memory _data
    ) internal returns (bool) {
        // 如果被授权者不是合约则表示接收成功
        if (to.code.length == 0) {
            return true;
        }
        // 调用被授权者的 onERC721Received 函数
        try
            IERC721Receiver(to).onERC721Received(
                msg.sender,
                from,
                totalSupply,
                _data
            )
        returns (bytes4 retval) {
            // 如果返回值为 ERC721_RECEIVED 则表示接收成功
            return retval == IERC721Receiver(to).onERC721Received.selector;
        } catch (bytes memory reason) {
            // 如果调用失败则表示接收失败
            if (reason.length == 0) {
                revert("ERC721: transfer to non ERC721Receiver implementer");
            } else {
                assembly {
                    revert(add(32, reason), mload(reason))
                }
            }
        }
    }

    // 安全转移 NFT  无 data 参数
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        // 调用安全转移 NFT
        _safeTransfer(from, to, tokenId, "");
    }

    // 安全转移 NFT  有 data 参数
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) public override {
        _safeTransfer(from, to, tokenId, data);
    }

    // 安全批量转移 NFT  内部函数
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal {
        // 调用转移 NFT
        _transfer(from, to, tokenId);
        // 检查被授权者是否接收 NFT
        require(
            _checkOnERC721Received(from, to, data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    // 铸造 NFT
    function mint(address to, string memory _tokenURI)
        public
        returns (uint256)
    {
        // 铸造 NFT
        return _mint(to, _tokenURI);
    }

    // 安全铸造 NFT  无 data 参数
    function safeMint(address to, string calldata _tokenURI)
        public
        returns (uint256)
    {
        return _safeMint(to, _tokenURI, "");
    }

    // 安全铸造 NFT  有 data 参数
    function safeMint(
        address to,
        string calldata _tokenURI,
        bytes calldata data
    ) public returns (uint256) {
        return _safeMint(to, _tokenURI, data);
    }

    // 铸造 NFT  内部函数
    function _mint(address to, string memory _tokenURI)
        internal
        returns (uint256)
    {
        // 被授权者地址不能为0
        require(to != address(0), "ERC721: mint to the zero address");

        // 更新当前 NFT ID
        totalSupply += 1;

        // 调用转移 NFT
        _addTokenTo(to, totalSupply);
        // 触发 NFT 转移事件
        emit Transfer(address(0), to, totalSupply);

        // 设置 Token URI
        _setTokenURI(totalSupply, _tokenURI);

        // 返回当前 NFT ID
        return totalSupply;
    }

    // 设置 Token URI 内部函数
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        // 设置 Token URI
        _tokenURIs[tokenId] = _tokenURI;
    }

    // 安全铸造 NFT  内部函数
    function _safeMint(
        address to,
        string memory _tokenURI,
        bytes memory _data
    ) internal returns (uint256) {
        // 检查被授权者是否接收 NFT
        require(
            _checkOnERC721Received(address(0), to, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
        // 调用铸造 NFT
        return _mint(to, _tokenURI);
    }

    // 销毁 NFT
    function burn(uint256 tokenId) public {
        // 合约调用者必须是 NFT 持有者
        require(
            msg.sender == _ownerOf(tokenId),
            "ERC721: caller is not the owner"
        );
        // 调用销毁 NFT
        _burn(tokenId);
    }

    // 销毁 NFT  内部函数
    function _burn(uint256 tokenId) internal {
        // 调用转移 NFT
        _transfer(_ownerOf(tokenId), address(0), tokenId);
    }
}

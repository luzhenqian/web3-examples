// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./IERC721.sol";

contract NoahNFTSwap is IERC721Receiver {
    // 挂单
    event Sell(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    // 撤单
    event Cancel(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );
    // 改价
    event ChangePrice(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    // 购买
    event Buy(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    // 订单结构体
    struct Order {
        address seller;
        uint256 price;
    }

    // 订单 合约地址 => TokenId => 订单
    mapping(address => mapping(uint256 => Order)) public orders;
    // 手续费比例，万分之一 单位：wei 在交易成功时由卖家支付
    uint256 public feeRate;
    // 手续费接收者
    address public feeReceiver;

    constructor(uint256 _feeRate, address _feeReceiver) {
        feeRate = _feeRate;
        feeReceiver = _feeReceiver;
    }

    // 接收 ERC721 NFT
    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // 挂单
    function sell(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external {
        IERC721 nftContract = IERC721(nftAddress); // 声明IERC721接口合约变量
        // 检查订单是否存在
        require(
            orders[nftAddress][tokenId].seller == address(0),
            "Order already exists"
        );
        // 检查价格是否大于 0
        require(price > 0, "Price should be greater than 0");
        // 检查是否是合约所有者
        require(
            msg.sender == nftContract.ownerOf(tokenId),
            "You are not the owner"
        );
        // 检查是否是合约接收者
        require(
            nftContract.getApproved(tokenId) == address(this),
            "You are not approved"
        );
        // 检查 Token 是否存在
        require(
            nftContract.ownerOf(tokenId) != address(0),
            "Token does not exist"
        );

        // 创建订单
        orders[nftAddress][tokenId] = Order(msg.sender, price);

        // 转移 NFT
        nftContract.safeTransferFrom(msg.sender, address(this), tokenId);

        // 触发事件
        emit Sell(msg.sender, nftAddress, tokenId, price);
    }

    // 撤单
    function cancel(address nftAddress, uint256 tokenId) external {
        // 检查订单是否存在
        require(
            orders[nftAddress][tokenId].seller != address(0),
            "Order does not exist"
        );
        // 检查是否是订单所有者
        require(
            orders[nftAddress][tokenId].seller == msg.sender,
            "You are not the seller"
        );

        // 删除订单
        delete orders[nftAddress][tokenId];

        // 获取 NFT 合约
        IERC721 nftContract = IERC721(nftAddress);

        // 转移 NFT
        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);

        // 触发事件
        emit Cancel(msg.sender, nftAddress, tokenId);
    }

    // 改价
    function changePrice(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external {
        // 检查订单是否存在
        require(
            orders[nftAddress][tokenId].seller != address(0),
            "Order does not exist"
        );
        // 检查是否是订单所有者
        require(
            orders[nftAddress][tokenId].seller == msg.sender,
            "You are not the seller"
        );
        // 检查价格是否大于 0
        require(price > 0, "Price should be greater than 0");

        // 更新订单价格
        orders[nftAddress][tokenId].price = price;

        // 触发事件
        emit ChangePrice(msg.sender, nftAddress, tokenId, price);
    }

    // 购买
    function buy(address nftAddress, uint256 tokenId) external payable {
        // 检查订单是否存在
        require(
            orders[nftAddress][tokenId].seller != address(0),
            "Order does not exist"
        );
        // 检查价格是否正确
        require(
            msg.value >= orders[nftAddress][tokenId].price,
            "Price is not correct"
        );

        // 获取 NFT 合约
        IERC721 nftContract = IERC721(nftAddress);

        // 获取订单所有者
        address seller = orders[nftAddress][tokenId].seller;

        uint256 price = orders[nftAddress][tokenId].price;

        // 转移 NFT
        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);

        // 计算手续费
        uint256 fee = (price * feeRate) / 10000;

        // 转移手续费
        payable(feeReceiver).transfer(fee);

        // 转移 ETH
        payable(seller).transfer(price - fee);

        // 如果有多余的 ETH，退回给买家
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        // 删除订单
        delete orders[nftAddress][tokenId];

        // 触发事件
        emit Buy(msg.sender, nftAddress, tokenId, msg.value);
    }

    // 回退函数
    fallback() external payable {}

    // 接收 ETH
    receive() external payable {
        revert("You cannot send ETH to this contract");
    }
}

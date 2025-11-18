// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC20.sol";

// 任何人都可以调用，但是需要支付手续费
contract AirdropFree {
    IERC20 public tokenContract; // 代币合约
    address public owner; // 合约发布者
    address private _marketingWalletAddress; // 营销钱包地址，用于收取手续费
    uint256 private _feeRate; // 手续费比例，单位：万分之一

    constructor(
        address _tokenContractAddress,
        address _marketingWallet,
        uint256 _fee
    ) {
        tokenContract = IERC20(_tokenContractAddress);
        _marketingWalletAddress = _marketingWallet;
        _feeRate = _fee;
        owner = msg.sender;
    }

    // 空投代币，多个地址对应一个数量
    function oneToMany(address[] memory _to, uint256 _amount) public {
        uint256 totalAmount = _amount * _to.length;
        // 计算手续费
        uint256 fee = (totalAmount * _feeRate) / 10000;
        // 增加手续费
        totalAmount += fee;
        // 验证调用者的代币数量是否足够
        require(
            tokenContract.balanceOf(msg.sender) >= totalAmount,
            "Not enough tokens in the address"
        );
        // 检查调用者授权数量是否足够
        require(
            tokenContract.allowance(msg.sender, address(this)) >= totalAmount,
            "Not enough tokens approved"
        );
        // 空投代币
        for (uint256 i = 0; i < _to.length; i++) {
            tokenContract.transferFrom(msg.sender, _to[i], _amount);
        }
        // 转移手续费
        tokenContract.transferFrom(msg.sender, _marketingWalletAddress, fee);
    }

    // 空投代币，一个地址对应一个数量
    function oneToOne(address[] memory _to, uint256[] memory _amount) public {
        // 验证数组长度是否相等
        require(
            _to.length == _amount.length,
            "The length of the two arrays must be the same"
        );
        // 计算总数量
        uint256 totalAmount = 0;
        // 计算手续费
        uint256 fee = 0;
        for (uint256 i = 0; i < _amount.length; i++) {
            totalAmount += _amount[i];
            fee += (_amount[i] * _feeRate) / 10000;
        }
        // 增加手续费
        totalAmount += fee;
        // 验证调用者的代币数量是否足够
        require(
            tokenContract.balanceOf(msg.sender) >= totalAmount,
            "Not enough tokens in the address"
        );
        // 检查调用者授权数量是否足够
        require(
            tokenContract.allowance(msg.sender, address(this)) >= totalAmount,
            "Not enough tokens approved"
        );
        // 空投代币
        for (uint256 i = 0; i < _to.length; i++) {
            tokenContract.transferFrom(msg.sender, _to[i], _amount[i]);
        }
        // 转移手续费
        tokenContract.transferFrom(msg.sender, _marketingWalletAddress, fee);
    }
}

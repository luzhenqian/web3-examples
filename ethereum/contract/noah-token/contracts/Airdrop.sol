// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC20.sol";

contract Airdrop {
    IERC20 public tokenContract; // 代币合约
    address public owner; // 合约发布者

    constructor(address _tokenContractAddress) {
        tokenContract = IERC20(_tokenContractAddress);
        owner = msg.sender;
    }

    // 空投代币，多个地址对应一个数量
    function oneToMany(address[] memory _to, uint256 _amount) public {
        // 只有合约发布者可以调用
        require(msg.sender == owner, "Only the owner can airdrop tokens");
        // 验证合约中的代币数量是否足够
        uint256 totalAmount = _amount * _to.length;
        require(
            tokenContract.balanceOf(address(this)) >= totalAmount,
            "Not enough tokens in the contract"
        );
        // 空投代币
        for (uint256 i = 0; i < _to.length; i++) {
            tokenContract.transfer(_to[i], _amount);
        }
    }

    // 空投代币，一个地址对应一个数量
    function oneToOne(address[] memory _to, uint256[] memory _amount) public {
        // 只有合约发布者可以调用
        require(msg.sender == owner, "Only the owner can airdrop tokens");
        // 验证数组长度是否相等
        require(
            _to.length == _amount.length,
            "The length of the two arrays must be the same"
        );
        // 验证合约中的代币是否足够
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amount.length; i++) {
            totalAmount += _amount[i];
        }
        require(
            tokenContract.balanceOf(address(this)) >= totalAmount,
            "Not enough tokens in the contract"
        );
        // 空投代币
        for (uint256 i = 0; i < _to.length; i++) {
            tokenContract.transfer(_to[i], _amount[i]);
        }
    }
}

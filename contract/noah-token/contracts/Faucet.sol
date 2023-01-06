// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC20.sol";

contract Faucet {
    IERC20 public tokenContract; // 代币合约
    mapping(address => uint256) public recivedRecord; // 领取记录
    uint256 public amountEachTime; // 每次领取的数量
    address public owner; // 合约发布者

    constructor(address _tokenContractAddress, uint256 _amountEachTime) {
        tokenContract = IERC20(_tokenContractAddress);
        amountEachTime = _amountEachTime;
        owner = msg.sender;
    }

    // 领取代币，每个地址每24小时只能领取一次
    function withdraw() external {
        if (recivedRecord[msg.sender] > 0) {
            require(
                recivedRecord[msg.sender] - block.timestamp >= 1 days,
                "You can only request tokens once every 24 hours"
            );
        }
        require(
            tokenContract.balanceOf(address(this)) >= amountEachTime,
            "Not enough tokens in the contract"
        );
        recivedRecord[msg.sender] = block.timestamp; // 更新领取记录
        tokenContract.transfer(msg.sender, amountEachTime); // 转账
    }

    // 设置每次领取的数量，只有合约发布者可以调用
    function setAmountEachTime(uint256 _amountEachTime) public {
        require(msg.sender == owner, "Only the owner can set the amount");
        amountEachTime = _amountEachTime; // 更新每次领取的数量
    }
}

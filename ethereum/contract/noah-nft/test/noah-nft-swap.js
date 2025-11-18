const NoahNFT = artifacts.require("NoahNFT");
const NoahNFTSwap = artifacts.require("NoahNFTSwap");
const BN = web3.utils.BN;

contract('NoahNFTSwap', (accounts) => {
  const [alice, bob, carol] = accounts;
  const baseUrl = 'https://nft.webnext.cloud/'
  // 模拟 NFT 数据
  const [NFTNoOne, NFTNoTwo] = [{
    uri: '1',
  }, {
    uri: '2',
  }]

  it('挂单', async () => {
    const noahNFTInstance = await NoahNFT.new('Noah', 'NOAH', baseUrl, { from: alice });
    // 手续费 1%，单位万分之一
    const feeRate = 100;
    const noahNFTSwapInstance = await NoahNFTSwap.new(feeRate, alice, { from: alice });
    // NFT 合约的地址
    const nftAddress = noahNFTInstance.address;
    // alice 铸造 1 个 NFT 并发送给自己
    await noahNFTInstance.mint(alice, NFTNoOne.uri, { from: alice });
    // alice 授权 noahNFTSwapInstance 合约可以操作自己的 NFT
    await noahNFTInstance.approve(noahNFTSwapInstance.address, 1, { from: alice });
    // 挂单价格，单位：wei
    const price = web3.utils.toWei('1');
    // 挂单
    await noahNFTSwapInstance.sell(nftAddress, 1, price, { from: alice });
    // 挂单成功后，NFT 所有权转移到了 noahNFTSwapInstance 合约
    assert.equal(await noahNFTInstance.ownerOf(1), noahNFTSwapInstance.address, "owner should be noahNFTSwapInstance");
    // 查看挂单信息
    const order = await noahNFTSwapInstance.orders(nftAddress, 1);
    // 卖家应该是 alice
    assert.equal(order.seller, alice, "seller should be alice");
  });

  it('改价', async () => {
    const noahNFTInstance = await NoahNFT.new('Noah', 'NOAH', baseUrl, { from: alice });
    // 手续费 1%，单位万分之一
    const feeRate = 100;
    const noahNFTSwapInstance = await NoahNFTSwap.new(feeRate, alice, { from: alice });
    // NFT 合约的地址
    const nftAddress = noahNFTInstance.address;
    // alice 铸造 1 个 NFT 并发送给自己
    await noahNFTInstance.mint(alice, NFTNoOne.uri, { from: alice });
    // alice 授权 noahNFTSwapInstance 合约可以操作自己的 NFT
    await noahNFTInstance.approve(noahNFTSwapInstance.address, 1, { from: alice });
    // 挂单价格，单位：wei
    const price = web3.utils.toWei('1');
    // 挂单
    await noahNFTSwapInstance.sell(nftAddress, 1, price, { from: alice });
    // 改价
    const newPrice = web3.utils.toWei('2');
    await noahNFTSwapInstance.changePrice(nftAddress, 1, newPrice, { from: alice });
    // 查看挂单信息
    const order = await noahNFTSwapInstance.orders(nftAddress, 1);
    // 价格应该是 2
    assert.equal(order.price.toString(), newPrice.toString(), "price should be 2");
  });

  it('撤单', async () => {
    const noahNFTInstance = await NoahNFT.new('Noah', 'NOAH', baseUrl, { from: alice });
    // 手续费 1%，单位万分之一
    const feeRate = 100;
    const noahNFTSwapInstance = await NoahNFTSwap.new(feeRate, alice, { from: alice });
    // NFT 合约的地址
    const nftAddress = noahNFTInstance.address;
    // alice 铸造 1 个 NFT 并发送给自己
    await noahNFTInstance.mint(alice, NFTNoOne.uri, { from: alice });
    // alice 授权 noahNFTSwapInstance 合约可以操作自己的 NFT
    await noahNFTInstance.approve(noahNFTSwapInstance.address, 1, { from: alice });
    // 挂单价格，单位：wei
    const price = web3.utils.toWei('1')
    // 挂单
    await noahNFTSwapInstance.sell(nftAddress, 1, price, { from: alice });
    // 取消挂单
    await noahNFTSwapInstance.cancel(nftAddress, 1, { from: alice });
    // 查看挂单信息
    const order = await noahNFTSwapInstance.orders(nftAddress, 1);
    // 挂单价格应该是 0
    assert.equal(order.price.toString(), '0', "price should be 0");
    // NFT 所有权应该是 alice
    assert.equal(await noahNFTInstance.ownerOf(1), alice, "owner should be alice");
  });

  it('购买', async () => {
    const noahNFTInstance = await NoahNFT.new('Noah', 'NOAH', baseUrl, { from: alice });
    // 手续费 1%，单位万分之一
    const feeRate = 100;
    // carol 是收益账户
    const noahNFTSwapInstance = await NoahNFTSwap.new(feeRate, carol, { from: alice });
    // NFT 合约的地址
    const nftAddress = noahNFTInstance.address;
    // alice 铸造 1 个 NFT 并发送给自己
    await noahNFTInstance.mint(alice, NFTNoOne.uri, { from: alice });
    // alice 授权 noahNFTSwapInstance 合约可以操作自己的 NFT
    await noahNFTInstance.approve(noahNFTSwapInstance.address, 1, { from: alice });
    // 挂单价格，单位：wei
    const price = web3.utils.toWei('1');
    // 挂单
    await noahNFTSwapInstance.sell(nftAddress, 1, price, { from: alice });
    // alice 原来的余额
    const aliceBalanceBefore = await web3.eth.getBalance(alice);
    // bob 原来的余额
    const bobBalanceBefore = await web3.eth.getBalance(bob);
    // carol 原来的余额
    const carolBalanceBefore = await web3.eth.getBalance(carol);
    // 计算手续费
    const fee = new BN(price).mul(new BN(feeRate)).div(new BN(10000));
    // gas 单位
    const gas = 1000000;
    // gas 价格
    const gasPrice = 1000000000;
    // bob 购买
    const result = await noahNFTSwapInstance.buy(nftAddress, 1, {
      from: bob, value: price,
      gas,
      gasPrice
    });
    // gasUsed
    const gasUsed = result.receipt.gasUsed * gasPrice;
    // alice 的余额应该是 aliceBalanceBefore + price - fee
    const aliceBalanceAfter = await web3.eth.getBalance(alice);
    assert.equal(aliceBalanceAfter.toString(), new BN(aliceBalanceBefore).add(new BN(price)).sub(new BN(fee)).toString(), "alice balance should be aliceBalanceBefore + price - fee");
    // bob 交易后的余额
    const bobBalanceAfter = await web3.eth.getBalance(bob);
    // bob 的余额应该是 bobBalanceBefore - price - gasUsed
    assert.equal(bobBalanceAfter.toString(), new BN(bobBalanceBefore).sub(new BN(price)).sub(new BN(gasUsed)).toString(), "bob balance should be bobBalanceBefore - price - gasUsed");
    // carol 交易后的余额
    const carolBalanceAfter = await web3.eth.getBalance(carol);
    // carol 的余额应该是 carolBalanceBefore + fee
    assert.equal(carolBalanceAfter.toString(), new BN(carolBalanceBefore).add(new BN(fee)).toString(),
      "carol balance should be carolBalanceBefore + fee");
    // NFT 所有权应该是 bob
    assert.equal(await noahNFTInstance.ownerOf(1), bob, "owner should be bob");
    // 挂单信息应该被清除
    const order = await noahNFTSwapInstance.orders(nftAddress, 1);
    assert.equal(order.price.toString(), '0', "price should be 0");
  });
});

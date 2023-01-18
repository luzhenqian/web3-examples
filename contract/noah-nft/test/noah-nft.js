const NoahNFT = artifacts.require("NoahNFT");

contract('NoahNFT', (accounts) => {
  const [alice, bob, carol] = accounts;
  const baseUrl = 'https://nft.webnext.cloud/'
  // 模拟 NFT 数据
  const [NFTNoOne, NFTNoTwo] = [{
    uri: '1',
  }, {
    uri: '2',
  }]

  it('mint', async () => {
    const noahInstance = await NoahNFT.new('Noah', 'NOAH', baseUrl, { from: alice });
    // alice 铸造 1 个 NFT 并发送给 bob
    await noahInstance.mint(bob, NFTNoOne.uri, { from: alice });
    // 检查 bob 的 NFT 数量是否为 1
    const bobNFTCount = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount.valueOf(), 1, "bob 应该有 1 个 NFT");
    // 检查 NFT 的所有者是否为 bob
    const tokenId = await noahInstance.totalSupply();
    const bobNFT = await noahInstance.ownerOf(tokenId);
    assert.equal(bobNFT.valueOf(), bob, "bob 应该是 NFT 的所有者");
    // 检查 NFT 的 URI 是否正确
    const bobNFTURI = await noahInstance.tokenURI(tokenId, { from: bob });
    assert.equal(bobNFTURI.valueOf(), baseUrl + NFTNoOne.uri, "NFT 的 URI 不正确");
    // bob 成为 NFT 的发行者，可以铸造 NFT
    await noahInstance.mint(bob, NFTNoTwo.uri, { from: bob });
    // 检查 bob 的 NFT 数量是否为 2
    const bobNFTCount2 = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount2.valueOf(), 2, "bob 应该有 2 个 NFT");
  });

  it("transferFrom", async () => {
    const noahInstance = await NoahNFT.new('Noah', 'NOAH', { from: alice });
    // alice 铸造 1 个 NFT 并发送给 bob
    await noahInstance.mint(bob, NFTNoOne.uri, { from: alice });
    // 检查 bob 的 NFT 数量是否为 1
    const bobNFTCount = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount.valueOf(), 1, "bob 应该有 1 个 NFT");
    // bob 转移 id 为 1 的 NFT 给 carol
    await noahInstance.transferFrom(bob, carol, 1, { from: bob });
    // 检查 bob 的 NFT 数量是否为 0
    const bobNFTCount2 = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount2.valueOf(), 0, "bob 应该有 0 个 NFT");
    // 检查 carol 的 NFT 数量是否为 1
    const carolNFTCount = await noahInstance.balanceOf(carol);
    assert.equal(carolNFTCount.valueOf(), 1, "carol 应该有 1 个 NFT");
  });

  it("approval", async () => {
    const noahInstance = await NoahNFT.new('Noah', 'NOAH', { from: alice });
    // alice 铸造 1 个 NFT 并发送给 bob
    await noahInstance.mint(bob, NFTNoOne.uri, { from: alice });
    // 检查 bob 的 NFT 数量是否为 1
    const bobNFTCount = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount.valueOf(), 1, "bob 应该有 1 个 NFT");
    // bob 授权 carol 转移 id 为 1 的 NFT
    await noahInstance.approve(carol, 1, { from: bob });
    // 检查 id 为 1 的 NFT 是否被 carol 授权
    const carolApproved = await noahInstance.getApproved(1, { from: carol });
    assert.equal(carolApproved.valueOf(), carol, "carol 应该被授权转移 id 为 1 的 NFT");
    // carol 转移 id 为 1 的 NFT 给 alice
    await noahInstance.transferFrom(bob, alice, 1, { from: carol });
    // 检查 bob 的 NFT 数量是否为 0
    const bobNFTCount2 = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount2.valueOf(), 0, "bob 应该有 0 个 NFT");
    // 检查 alice 的 NFT 数量是否为 1
    const aliceNFTCount = await noahInstance.balanceOf(alice);
    assert.equal(aliceNFTCount.valueOf(), 1, "alice 应该有 1 个 NFT");
  });

  it("setApprovalForAll", async () => {
    const noahInstance = await NoahNFT.new('Noah', 'NOAH', { from: alice });
    // alice 铸造 2 个 NFT 并发送给 bob
    await noahInstance.mint(bob, NFTNoOne.uri, { from: alice });
    await noahInstance.mint(bob, NFTNoTwo.uri, { from: alice });
    // 检查 bob 的 NFT 数量是否为 2
    const bobNFTCount = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount.valueOf(), 2, "bob 应该有 2 个 NFT");
    // bob 授权 carol 转移所有 NFT
    await noahInstance.setApprovalForAll(carol, true, { from: bob });
    // 检查 carol 是否被授权转移所有 NFT
    const carolApproved = await noahInstance.isApprovedForAll(bob, carol, { from: carol });
    assert.equal(carolApproved.valueOf(), true, "carol 应该被授权转移所有 NFT");
    // carol 转移 id 为 1 的 NFT 给 alice
    await noahInstance.transferFrom(bob, alice, 1, { from: carol });
    // 检查 bob 的 NFT 数量是否为 1
    const bobNFTCount2 = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount2.valueOf(), 1, "bob 应该有 1 个 NFT");
    // 检查 alice 的 NFT 数量是否为 1
    const aliceNFTCount = await noahInstance.balanceOf(alice);
    assert.equal(aliceNFTCount.valueOf(), 1, "alice 应该有 1 个 NFT");
    // 检查 id 为 2 的 NFT 所有者是否为 bob
    const NFTNoTwoOwner = await noahInstance.ownerOf(2, { from: bob });
    assert.equal(NFTNoTwoOwner.valueOf(), bob, "id 为 2 的 NFT 所有者应该是 bob");
  });
});

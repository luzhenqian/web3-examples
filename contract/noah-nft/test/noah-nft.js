const NoahNFT = artifacts.require("NoahNFT");

contract('NoahNFT', (accounts) => {
  const [alice, bob, carol] = accounts;
  // 模拟 NFT 数据
  const [NFTNoOne, NFTNoTwo] = [{
    id: 1,
    uri: 'https://nft.webnext.cloud/1',
  }, {
    id: 2,
    uri: 'https://nft.webnext.cloud/2',
  }]

  it('mint', async () => {
    const noahInstance = await NoahNFT.new('Noah', 'NOAH', { from: alice });
    // alice 铸造 1 个 NFT 并发送给 bob
    await noahInstance.mint(bob, NFTNoOne.id, NFTNoOne.uri, { from: alice });
    // 检查 bob 的 NFT 数量是否为 1
    const bobNFTCount = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount.valueOf(), 1, "bob 应该有 1 个 NFT");
    // 检查 NFT 的所有者是否为 bob
    const bobNFT = await noahInstance.ownerOf(NFTNoOne.id);
    assert.equal(bobNFT.valueOf(), bob, "bob 应该是 NFT 的所有者");
    // 检查 NFT 的 URI 是否正确
    const bobNFTURI = await noahInstance.tokenURI(NFTNoOne.id, { from: bob });
    assert.equal(bobNFTURI.valueOf(), NFTNoOne.uri, "NFT 的 URI 不正确");

    try {
      // bob 不是 NFT 的发行者，不能铸造 NFT
      await noahInstance.mint(bob, NFTNoTwo.id, NFTNoTwo.uri, { from: bob });
    } catch (e) {
      assert.include(e.message, 'caller is not the minter', 'bob 不是 NFT 的发行者，不能铸造 NFT')
    }

    // 添加 bob 为 NFT 的发行者
    await noahInstance.approveMinter(bob, true, { from: alice });
    // bob 成为 NFT 的发行者，可以铸造 NFT
    await noahInstance.mint(bob, NFTNoTwo.id, NFTNoTwo.uri, { from: bob });
    // 检查 bob 的 NFT 数量是否为 2
    const bobNFTCount2 = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount2.valueOf(), 2, "bob 应该有 2 个 NFT");
  });

  it("transferFrom", async () => {
    const noahInstance = await NoahNFT.new('Noah', 'NOAH', { from: alice });
    // alice 铸造 1 个 NFT 并发送给 bob
    await noahInstance.mint(bob, NFTNoOne.id, NFTNoOne.uri, { from: alice });
    // 检查 bob 的 NFT 数量是否为 1
    const bobNFTCount = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount.valueOf(), 1, "bob 应该有 1 个 NFT");
    // bob 转移 id 为 1 的 NFT 给 carol
    await noahInstance.transferFrom(bob, carol, NFTNoOne.id, { from: bob });
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
    await noahInstance.mint(bob, NFTNoOne.id, NFTNoOne.uri, { from: alice });
    // 检查 bob 的 NFT 数量是否为 1
    const bobNFTCount = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount.valueOf(), 1, "bob 应该有 1 个 NFT");
    // bob 授权 carol 转移 id 为 1 的 NFT
    await noahInstance.approve(carol, NFTNoOne.id, { from: bob });
    // 检查 id 为 1 的 NFT 是否被 carol 授权
    const carolApproved = await noahInstance.getApproved(NFTNoOne.id, { from: carol });
    assert.equal(carolApproved.valueOf(), carol, "carol 应该被授权转移 id 为 1 的 NFT");
    // carol 转移 id 为 1 的 NFT 给 alice
    await noahInstance.transferFrom(bob, alice, NFTNoOne.id, { from: carol });
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
    await noahInstance.mint(bob, NFTNoOne.id, NFTNoOne.uri, { from: alice });
    await noahInstance.mint(bob, NFTNoTwo.id, NFTNoTwo.uri, { from: alice });
    // 检查 bob 的 NFT 数量是否为 2
    const bobNFTCount = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount.valueOf(), 2, "bob 应该有 2 个 NFT");
    // bob 授权 carol 转移所有 NFT
    await noahInstance.setApprovalForAll(carol, true, { from: bob });
    // 检查 carol 是否被授权转移所有 NFT
    const carolApproved = await noahInstance.isApprovedForAll(bob, carol, { from: carol });
    assert.equal(carolApproved.valueOf(), true, "carol 应该被授权转移所有 NFT");
    // carol 转移 id 为 1 的 NFT 给 alice
    await noahInstance.transferFrom(bob, alice, NFTNoOne.id, { from: carol });
    // 检查 bob 的 NFT 数量是否为 1
    const bobNFTCount2 = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount2.valueOf(), 1, "bob 应该有 1 个 NFT");
    // 检查 alice 的 NFT 数量是否为 1
    const aliceNFTCount = await noahInstance.balanceOf(alice);
    assert.equal(aliceNFTCount.valueOf(), 1, "alice 应该有 1 个 NFT");
    // 检查 id 为 2 的 NFT 所有者是否为 bob
    const NFTNoTwoOwner = await noahInstance.ownerOf(NFTNoTwo.id, { from: bob });
    assert.equal(NFTNoTwoOwner.valueOf(), bob, "id 为 2 的 NFT 所有者应该是 bob");
  });

  it("approvalMinter", async () => {
    const noahInstance = await NoahNFT.new('Noah', 'NOAH', { from: alice });
    // alice 授权 bob 成为铸造者
    await noahInstance.approveMinter(bob, true, { from: alice });
    // 检查 bob 是否被授权成为铸造者
    const bobApproved = await noahInstance.isMinter(bob, { from: bob });
    assert.equal(bobApproved.valueOf(), true, "bob 应该被授权成为铸造者");
    // bob 铸造 1 个 NFT 并发送给 carol
    await noahInstance.mint(carol, NFTNoOne.id, NFTNoOne.uri, { from: bob });
    // 检查 carol 的 NFT 数量是否为 1
    const carolNFTCount = await noahInstance.balanceOf(carol);
    assert.equal(carolNFTCount.valueOf(), 1, "carol 应该有 1 个 NFT");
    // 撤销 bob 的铸造者权限
    await noahInstance.approveMinter(bob, false, { from: alice });
    // 检查 bob 是否被授权成为铸造者
    const bobApproved2 = await noahInstance.isMinter(bob, { from: bob });
    assert.equal(bobApproved2.valueOf(), false, "bob 应该被撤销铸造者权限");
    try {
      // bob 再次尝试铸造 1 个 NFT 并发送给 carol
      await noahInstance.mint(carol, NFTNoTwo.id, NFTNoTwo.uri, { from: bob });
      assert.fail("bob 应该没有铸造者权限");
    } catch (e) {
      assert.include(e.message, "caller is not the minter", "bob 应该没有铸造者权限");
    }
  });
});

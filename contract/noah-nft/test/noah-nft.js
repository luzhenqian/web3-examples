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
    await noahInstance.addMinter(bob, { from: alice });
    // bob 成为 NFT 的发行者，可以铸造 NFT
    await noahInstance.mint(bob, NFTNoTwo.id, NFTNoTwo.uri, { from: bob });
    // 检查 bob 的 NFT 数量是否为 2
    const bobNFTCount2 = await noahInstance.balanceOf(bob);
    assert.equal(bobNFTCount2.valueOf(), 2, "bob 应该有 2 个 NFT");
  });
});

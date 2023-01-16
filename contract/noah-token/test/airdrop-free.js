const NoahToken = artifacts.require("NoahToken");
const AirdropFree = artifacts.require("AirdropFree");

contract("AirdropFree", (accounts) => {
  const [alice, bob, carol, dave] = accounts;

  it("oneToMany", async () => {
    // 发 Noah 币，发行 10240000 个
    const noahTokenInstance = await NoahToken.new('noah', 'NOAH', 0, '10240000', { from: alice });
    // 发空投合约 设置营销收款账户为 dave；手续费为万分之 10（0.001）
    const airdropInstance = await AirdropFree.new(noahTokenInstance.address, dave, 10, { from: alice });
    // 授权空投合约可以操作 10000 个 Noah 币
    await noahTokenInstance.approve(airdropInstance.address, 10000, { from: alice });
    // 给 2 个账户发空投，每个账户 1000 个 Noah 币
    const amount = 1000;
    await airdropInstance.oneToMany([bob, carol], amount, { from: alice });
    // 检查 2 个账户的 Noah 币数量
    const bobBalance = await noahTokenInstance.balanceOf(bob);
    const carolBalance = await noahTokenInstance.balanceOf(carol);
    assert.equal(bobBalance.toString(), amount, "bob balance is not 1000");
    assert.equal(carolBalance.toString(), amount, "carol balance is not 1000");
    const daveBalance = await noahTokenInstance.balanceOf(dave);
    const fee = amount * 2 * 0.001// 手续费
    // 检查 dave 的营销收款是否正确
    assert.equal(daveBalance.toString(), fee, "dave balance is not 2");
    const airdropTotalAmount = amount * 2 + fee;// 空投总费用
    // 检查 alice 的 Noah 币数量
    const aliceBalance = await noahTokenInstance.balanceOf(alice);
    assert.equal(aliceBalance.toString(), 10240000 - airdropTotalAmount, "alice balance is not 10237998");
  });

  it("oneToOne", async () => {
    // 发 Noah 币，发行 10240000 个
    const noahTokenInstance = await NoahToken.new('noah', 'NOAH', 0, '10240000', { from: alice });
    // 发空投合约
    const airdropInstance = await AirdropFree.new(noahTokenInstance.address, dave, 10, { from: alice });
    // 授权空投合约可以操作 10000 个 Noah 币
    await noahTokenInstance.approve(airdropInstance.address, 10000, { from: alice });
    // 给 2 个账户发空投，bob 1000 个，carol 2000 个
    const amounts = [1000, 2000];
    await airdropInstance.oneToOne([bob, carol], amounts, { from: alice });
    // 检查 2 个账户的 Noah 币数量
    const bobBalance = await noahTokenInstance.balanceOf(bob);
    const carolBalance = await noahTokenInstance.balanceOf(carol);
    assert.equal(bobBalance.toString(), amounts[0], "bob balance is not 10");
    assert.equal(carolBalance.toString(), amounts[1], "carol balance is not 15");
    const fee = amounts[0] * 0.001 + amounts[1] * 0.001// 手续费
    // 检查 dave 的营销收款是否正确
    const daveBalance = await noahTokenInstance.balanceOf(dave);
    assert.equal(daveBalance.toString(), fee, "dave balance is not 3");
    const airdropTotalAmount = amounts[0] + amounts[1] + fee;// 空投总费用
    // 检查 alice 的 Noah 币数量
    const aliceBalance = await noahTokenInstance.balanceOf(alice);
    assert.equal(aliceBalance.toString(), 10240000 - airdropTotalAmount, "alice balance is not 10236997");
  });
});

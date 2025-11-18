const NoahToken = artifacts.require("NoahToken");
const Airdrop = artifacts.require("Airdrop");

contract("Airdrop", (accounts) => {
  const [alice, bob, carol, dave] = accounts;

  it("oneToMany", async () => {
    // 发 Noah 币，发行 1024 个
    const noahTokenInstance = await NoahToken.new('noah', 'NOAH', 0, '1024', { from: alice });
    // 发空投合约
    const airdropInstance = await Airdrop.new(noahTokenInstance.address, { from: alice });
    // 给空投合约转账 100 个 Noah 币
    const airdropTotalAmount = 100;
    await noahTokenInstance.transfer(airdropInstance.address, airdropTotalAmount, { from: alice });
    // 给 3 个账户发空投，每个账户 10 个 Noah 币
    const amount = 10;
    await airdropInstance.oneToMany([bob, carol, dave], amount, { from: alice });
    // 检查 3 个账户的 Noah 币数量
    const bobBalance = await noahTokenInstance.balanceOf(bob);
    const carolBalance = await noahTokenInstance.balanceOf(carol);
    const daveBalance = await noahTokenInstance.balanceOf(dave);
    assert.equal(bobBalance.toString(), amount);
    assert.equal(carolBalance.toString(), amount);
    assert.equal(daveBalance.toString(), amount);
    // 检查空投合约的 Noah 币数量
    const airdropBalance = await noahTokenInstance.balanceOf(airdropInstance.address);
    assert.equal(airdropBalance.toString(), airdropTotalAmount - 3 * amount);
  });

  it("oneToOne", async () => {
    // 发 Noah 币，发行 1024 个
    const noahTokenInstance = await NoahToken.new('noah', 'NOAH', 0, '1024', { from: alice });
    // 发空投合约
    const airdropInstance = await Airdrop.new(noahTokenInstance.address, { from: alice });
    // 给空投合约转账 100 个 Noah 币
    const airdropTotalAmount = 100;
    await noahTokenInstance.transfer(airdropInstance.address, airdropTotalAmount, { from: alice });
    // 给 3 个账户发空投，bob 10 个，carol 15 个，dave 20 个
    const amounts = [10, 15, 20];
    await airdropInstance.oneToOne([bob, carol, dave], amounts, { from: alice });
    // 检查 3 个账户的 Noah 币数量
    const bobBalance = await noahTokenInstance.balanceOf(bob);
    const carolBalance = await noahTokenInstance.balanceOf(carol);
    const daveBalance = await noahTokenInstance.balanceOf(dave);
    assert.equal(bobBalance.toString(), amounts[0]);
    assert.equal(carolBalance.toString(), amounts[1]);
    assert.equal(daveBalance.toString(), amounts[2]);
    // 检查空投合约的 Noah 币数量
    const airdropBalance = await noahTokenInstance.balanceOf(airdropInstance.address);
    assert.equal(airdropBalance.toString(), airdropTotalAmount - amounts.reduce((a, b) => a + b));
  });
});

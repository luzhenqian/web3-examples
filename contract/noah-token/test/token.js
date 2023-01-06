const NoahToken = artifacts.require("NoahToken");

contract("Token", (accounts) => {
  const [alice, bob] = accounts;

  it("balanceOf", async () => {
    const noahTokenInstance = await NoahToken.new('noah', 'NOAH', 0, '1024', { from: alice });
    const result = await noahTokenInstance.balanceOf(alice);
    assert.equal(result.valueOf().words[0], 1024, "1024 wasn't in alice");
  });

  it("transfer", async () => {
    const noahTokenInstance = await NoahToken.new('noah', 'NOAH', 0, '1024', { from: alice });
    await noahTokenInstance.transfer(bob, 1, { from: alice });
    let aliceBalanceResult = await noahTokenInstance.balanceOf(alice);
    let bobBalanceResult = await noahTokenInstance.balanceOf(bob);
    assert.equal(aliceBalanceResult.valueOf().words[0], 1023, "1023 wasn't in alice");
    assert.equal(bobBalanceResult.valueOf().words[0], 1, "1 wasn't in bob");

    await noahTokenInstance.transfer(alice, 1, { from: bob });
    aliceBalanceResult = await noahTokenInstance.balanceOf(alice);
    bobBalanceResult = await noahTokenInstance.balanceOf(bob);
    assert.equal(aliceBalanceResult.valueOf().words[0], 1024, "1024 wasn't in alice");
    assert.equal(bobBalanceResult.valueOf().words[0], 0, "0 wasn't in bob");
  });
});

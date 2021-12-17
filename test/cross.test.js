const assert = require('assert');
const RecordDelegate = artifacts.require('RecordDelegate');

contract("RecordDelegate", accounts => {
  let delegate;
  let owner;
  let operator;

  beforeEach(async ()=>{
    [owner, operator] = accounts;
    delegate = await RecordDelegate.new();
    await delegate.initialize(owner, operator);
  });

  it("should success when setMinCrossChainAmount", async () => {
    const symbol = web3.utils.asciiToHex("BTC");
    const chainID = web3.utils.toBN("0x8057414e");
    const amount = web3.utils.toBN("100");
    let receipt = await delegate.setMinCrossChainAmount([symbol, chainID, amount], {from: operator});
    let log = receipt.logs[0];
    assert.equal(log.event, "SetMinCrossChainAmount", "check event failed");
    assert.equal(log.args.symbol, symbol, "check symbol failed");
    assert.equal(log.args.chainID.eq(web3.utils.toBN(chainID)), true, "check chainID failed");
    assert.equal(log.args.amount.eq(web3.utils.toBN(amount)), true, "check amount failed");
  });

  it("should success when setMinCrossChainAmounts", async () => {
    const symbol = web3.utils.asciiToHex("BTC");
    const chainID = web3.utils.toBN("0x8057414e");
    const amount = web3.utils.toBN("200");
    let receipt = await delegate.setMinCrossChainAmounts([[symbol, chainID, amount]], {from: operator});
    let log = receipt.logs[0];
    assert.equal(log.event, "SetMinCrossChainAmount", "check event failed");
    assert.equal(log.args.symbol, symbol, "check symbol failed");
    assert.equal(log.args.chainID.eq(web3.utils.toBN(chainID)), true, "check chainID failed");
    assert.equal(log.args.amount.eq(web3.utils.toBN(amount)), true, "check amount failed");
  });

  it("should failed when setMinCrossChainAmounts without access", async () => {
    try {
      await delegate.setMinCrossChainAmounts([[web3.utils.asciiToHex("BTC"), "0x8057414e", "100"]], {from: owner});
      assert.fail('never go here');
    } catch (e) {
      console.log(e);
      assert.ok(e.message.match(/no access/));
    }
  });

  it("should success when setMinCrossChainAmounts and getMinCrossChainAmount", async () => {
    const symbol = web3.utils.asciiToHex("DOGE");
    const chainID = web3.utils.toBN("0x8057414e");
    const amount = web3.utils.toBN("10000");
    await delegate.setMinCrossChainAmounts([[symbol, chainID, amount]], {from: operator});
    let recordAmount = web3.utils.toBN(await delegate.getMinCrossChainAmount(symbol, chainID));
    assert.strictEqual(recordAmount.eq(amount), true, "check minimus cross-chain amount failed");
  });

  it("should success when getMinCrossChainAmount without setMinCrossChainAmounts", async () => {
    const symbol = web3.utils.asciiToHex("LTC");
    const chainID = web3.utils.toBN("0x8057414e");
    let recordAmount = web3.utils.toBN(await delegate.getMinCrossChainAmount(symbol, chainID));
    assert.strictEqual(recordAmount.eq(web3.utils.toBN(0)), true, "check minimus cross-chain amount failed");
  });
});
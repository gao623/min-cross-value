const assert = require('assert');
const RecordDelegate = artifacts.require('RecordDelegate');

contract("RecordDelegate", accounts => {
  let delegate;
  let owner;
  let operator;
  let zero = web3.utils.toBN("0");

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

  it("should success when setMinCrossChainAmounts again", async () => {
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



  it("set agent fee should success when setCrossChainAgentFees about chains", async () => {
    const srcChainID = web3.utils.toBN("0x8000003c");
    const destChainID = web3.utils.toBN("0x8057414e");
    const tokenPairID = web3.utils.toBN("0");
    const value = web3.utils.toBN("1e16");
    const isPercent = false;
    let receipt = await delegate.setCrossChainAgentFees([[srcChainID, destChainID, tokenPairID, value, isPercent]], {from: operator});
    let log = receipt.logs[0];
    assert.equal(log.event, "SetCrossChainAgentFee", "check event failed");
    assert.equal(log.args.srcChainID.eq(srcChainID), true, "check srcChainID failed");
    assert.equal(log.args.destChainID.eq(destChainID), true, "check destChainID failed");
    assert.equal(log.args.tokenPairID.eq(tokenPairID), true, "check tokenPairID failed");
    assert.equal(log.args.numerator.eq(value), true, "check numerator failed");
    assert.equal(log.args.denominator.eq(zero), true, "check denominator failed");
    assert.equal(log.args.isPercent, isPercent, "check isPercent failed");
  });

  it("set agent fee rate should success when setCrossChainAgentFee about chains", async () => {
    const srcChainID = web3.utils.toBN("0x8000003c");
    const destChainID = web3.utils.toBN("0x8057414e");
    const tokenPairID = web3.utils.toBN("0");
    const value = web3.utils.toBN("1e16");
    const isPercent = true;
    const DENOMINATOR = web3.utils.toBN(await delegate.DENOMINATOR());
    let receipt = await delegate.setCrossChainAgentFee([srcChainID, destChainID, tokenPairID, value, isPercent], {from: operator});
    let log = receipt.logs[0];
    assert.equal(log.event, "SetCrossChainAgentFee", "check event failed");
    assert.equal(log.args.srcChainID.eq(srcChainID), true, "check srcChainID failed");
    assert.equal(log.args.destChainID.eq(destChainID), true, "check destChainID failed");
    assert.equal(log.args.tokenPairID.eq(tokenPairID), true, "check tokenPairID failed");
    assert.equal(log.args.numerator.eq(value), true, "check numerator failed");
    assert.equal(log.args.denominator.eq(DENOMINATOR), true, "check denominator failed");
    assert.equal(log.args.isPercent, isPercent, "check isPercent failed");
  });

  it("set agent fee rate should failed when setCrossChainAgentFees about chains: numerator too large", async () => {
    const srcChainID = web3.utils.toBN("0x8000003c");
    const destChainID = web3.utils.toBN("0x8057414e");
    const tokenPairID = web3.utils.toBN("0");
    const value = web3.utils.toBN(await delegate.DENOMINATOR());
    const isPercent = true;
    try {
      await delegate.setCrossChainAgentFees([[srcChainID, destChainID, tokenPairID, value, isPercent]], {from: operator});
      assert.fail('never go here');
    } catch (err) {
      if (!err.toString().includes("too large value")) {
        assert.fail(err);
      }
    }
  });

  it("should failed when setCrossChainAgentFees without access", async () => {
    try {
      const srcChainID = web3.utils.toBN("0x8000003c");
      const destChainID = web3.utils.toBN("0x8057414e");
      const tokenPairID = web3.utils.toBN("0");
      const value = web3.utils.toBN("1e16");
      const isPercent = false;
      await delegate.setCrossChainAgentFees([[srcChainID, destChainID, tokenPairID, value, isPercent]], {from: owner});
      assert.fail('never go here');
    } catch (e) {
      console.log(e);
      assert.ok(e.message.match(/no access/));
    }
  });

  it("should success when setCrossChainAgentFees and getCrossChainAgentFee", async () => {
    const srcChainID = web3.utils.toBN("0x8000003c");
    const destChainID = web3.utils.toBN("0x8057414e");
    const tokenPairID = web3.utils.toBN("0");
    const value = web3.utils.toBN("1e16");
    const isPercent = false;
    await delegate.setCrossChainAgentFees([[srcChainID, destChainID, tokenPairID, value, isPercent]], {from: operator});
    let info = await delegate.getCrossChainAgentFee(srcChainID, destChainID, tokenPairID);
    assert.strictEqual(web3.utils.toBN(info.numerator).eq(value), true, "check numerator failed");
    assert.strictEqual(web3.utils.toBN(info.denominator).eq(zero), true, "check denominator failed");
  });

  it("should success when getMinCrossChainAmount without setMinCrossChainAmounts", async () => {
    const srcChainID = web3.utils.toBN("0x8000003c");
    const destChainID = web3.utils.toBN("0x8057414e");
    const tokenPairID = web3.utils.toBN("0");
    const value = web3.utils.toBN("1e16");
    const isPercent = false;
    await delegate.setCrossChainAgentFee([srcChainID, destChainID, tokenPairID, value, isPercent], {from: operator});
    let info = await delegate.getCrossChainAgentFee(srcChainID, destChainID, tokenPairID);
    assert.strictEqual(web3.utils.toBN(info.numerator).eq(value), true, "check numerator failed");
    assert.strictEqual(web3.utils.toBN(info.denominator).eq(zero), true, "check denominator failed");
  });
});
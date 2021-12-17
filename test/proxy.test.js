const assert = require('assert');

const CommonProxy = artifacts.require('CommonProxy');
const RecordDelegate = artifacts.require('RecordDelegate');

contract("CommonProxy", accounts => {
  let proxy;
  let delegate;
  let delegate2;
  let owner;
  let notOwner;
  let newOwner;
  let delegateOwner;
  let delegateOperator;

  beforeEach(async ()=>{
    [owner, notOwner, newOwner, delegateOwner, delegateOperator] = accounts;
    delegate = await RecordDelegate.new();
    delegate2 = await RecordDelegate.new();
    proxy = await CommonProxy.new(delegate.address, owner, '0x');
  });

  it("should success when upgrade", async () => {
    await proxy.upgradeTo(delegate2.address, {from: owner});
  });

  it("should failed when upgrade without access", async () => {
    try {
      await proxy.upgradeTo(delegate2.address, {from: notOwner});
      assert.fail('never go here');
    } catch (e) {
      assert.ok(e.message.match(/revert/));
    }
  });

  it("should success when changeAdmin", async () => {
    await proxy.changeAdmin(newOwner, {from: owner});

  });

  it("should failed when changeAdmin without access", async () => {

    try {
      await proxy.changeAdmin(newOwner, {from: notOwner});

      assert.fail('never go here');
    } catch (e) {
      assert.ok(e.message.match(/revert/));
    }
  });

  it("should failed when call to delegate function without access", async () => {
    try {
      const delegate = await RecordDelegate.at(proxy.address);
      await delegate.initialize(delegateOwner, delegateOperator, {from: owner});
      assert.fail('never go here');
    } catch (e) {
      assert.ok(e.message.match(/revert/));
    }
  });
});


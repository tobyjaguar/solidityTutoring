Promise = require("bluebird");
const BigNumber = require('bignumber.js');
const Splitter = artifacts.require("./Splitter.sol");

const expectedExceptionPromise = require("../util/expectedException.js");
const sequentialPromise = require("../util/sequentialPromise.js");

if (typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

contract ('Splitter', function(accounts) {

  const owner = accounts[0];
  const user01 = accounts[1];
  const user02 = accounts[2];
  const addr00 = "0x0000000000000000000000000000000000000000";
  const amount = new BigNumber(100);
  const intOverflow = Math.pow(2,256) - 1;
  const maxJSvalue = Number.MAX_VALUE;

  beforeEach(function() {
    //console.log(JSON.stringify("symbol: " + result, null, 4));
    return Splitter.new({from: owner})
    .then(function(instance) {
      contractInstance = instance;
    });
  });

  describe("Testing splitMembers functionality", () => {

    //test split values
    it("Should split amount", function() {
      return contractInstance.splitMembers(user01, user02, {from: owner, value: amount})
      .then(result => {
        // check emitted event
        assert.strictEqual(result.logs[0].event, "LogSplitMembers", "Contract did not emit correct event name");
        assert.strictEqual(result.logs[0].args.sender, owner, "Contract did not emit correct event sender");
        assert.strictEqual(result.logs[0].args.splitAddress1, user01, "Contract did not emit correct event splitAddress");
        assert.strictEqual(result.logs[0].args.splitAddress2, user02, "Contract did not emit correct event splitAddress");
        assert.strictEqual(result.logs[0].args.splitAmount.toString(), amount.div(2).toString(), "Contract did not emit correct event amount");

        // check contract balances
        // check balance for user 01
        return contractInstance.balances(user01, {from: user01});
      })
      .then(balance => {
        assert.strictEqual(balance.toString(), amount.div(2).toString(), "Contract balance for split address 1 did not return correctly");
        // check balance for user 02
        return contractInstance.balances(user02, {from: user02});
      })
      .then(balance => {
        assert.strictEqual(balance.toString(), amount.div(2).toString(), "Contract balance for split address 2 did not return correctly");
      });
    }); //end split test

    let hash;
    let gasUsed;
    let gasPrice;
    let txFee;
    let balanceBefore = new BigNumber(0);

    it("Should correctly debit the sender's account", function() {
      return web3.eth.getBalancePromise(owner)
      .then(balance => {
        balanceBefore = new BigNumber(balance);
        return contractInstance.splitMembers(user01, user02, {from: owner, value: amount});
      })
      .then(txObj => {
        hash = txObj.receipt.transactionHash;
        gasUsed = new BigNumber(txObj.receipt.gasUsed);
        return web3.eth.getTransactionPromise(hash);
      })
      .then(tx => {
        gasPrice = new BigNumber(tx.gasPrice);
        return web3.eth.getBalancePromise(owner);
      })
      .then(balanceNow => {
        txFee = gasPrice.times(gasUsed);
        assert.strictEqual(balanceNow, balanceBefore.minus(amount).minus(txFee).toString(), "Sender's balance did not debit correctly");
      });
    }); // end debit test

    // test failing cases
    it.skip("Should fail to split if msg.sender is zero", function() {
      return expectedExceptionPromise(
        () => contractInstance.splitMembers(
          user01,
          user02,
          {from: addr00, value: amount, gas: 8000000 }),
        3000000);
    }); //end test

    it("Should fail to split if first splitting address is zero", function() {
      return expectedExceptionPromise(
        () => contractInstance.splitMembers(
          addr00,
          user02,
          {from: owner, value: amount, gas: 8000000 }),
        3000000);
    }); //end test

    it("Should fail to split if second splitting address is zero", function() {
      return expectedExceptionPromise(
        () => contractInstance.splitMembers(
          user01,
          addr00,
          {from: owner, value: amount, gas: 8000000 }),
        3000000);
    }); //end test

    it("Should fail to split if msg.value is zero", function() {
      return expectedExceptionPromise(
        () => contractInstance.splitMembers(
          user01,
          user02,
          {from: owner, value: 0, gas: 8000000 }), // value is zero
        3000000);
    }); //end test

  }); //end describe splitMembers

}); //end contract test suite

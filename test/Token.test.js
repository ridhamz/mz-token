const Token = artifacts.require('./Token');
require('chai').use(require('chai-as-promised')).should();

const tokens = (n) => web3.utils.toWei(n.toString(), 'ether');
const EVM_REVERT = 'VM Exception while processing transaction: revert';

contract('Token', ([deployer, receiver]) => {
  let token;
  const name = 'mz-token';
  const symbol = 'MZ';
  const decimals = '18';
  const totalSupply = '1000000000000000000000000';
  beforeEach(async () => {
    // fetch token from blockchain each time
    token = await Token.new();
  });

  describe('deployment', () => {
    it('tracks the name', async () => {
      const result = await token.name();
      result.should.equal(name);
    });

    it('tracks the symbol', async () => {
      const result = await token.symbol();
      result.should.equal(symbol);
    });

    it('tracks the decimals', async () => {
      const result = await token.decimals();
      result.toString().should.equal(decimals);
    });

    it('tracks the total supply', async () => {
      const result = await token.totalSupply();
      result.toString().should.equal(totalSupply);
    });

    it('assigns the total supply to the deployer', async () => {
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply);
    });
  });

  describe('sending tokens', () => {
    let amount;
    let result;
    beforeEach(async () => {
      amount = tokens(100);
      token = await Token.new();
      result = await token.transfer(receiver, amount, { from: deployer });
    });

    it('transfers token balances', async () => {
      const balanceOf1 = await token.balanceOf(deployer);
      balanceOf1.toString().should.equal(tokens(999900));
      const balanceOf2 = await token.balanceOf(receiver);
      balanceOf2.toString().should.equal(tokens(100));
    });

    it('emits a transfer event', async () => {
      const log = result.logs[0];
      log.event.should.equal('Transfer');
      const event = log.args;
      event.from.toString().should.equal(deployer, 'from is correct');
      event.to.toString().should.equal(receiver, 'to is correct');
      event.value
        .toString()
        .should.equal(amount.toString(), 'value is correct');
    });
  });

  describe('success', () => {
    let amount;
    let result;
    beforeEach(async () => {
      amount = tokens(100);
      token = await Token.new();
      result = await token.transfer(receiver, amount, { from: deployer });
    });

    it('transfers token balances', async () => {
      const balanceOf1 = await token.balanceOf(deployer);
      balanceOf1.toString().should.equal(tokens(999900));
      const balanceOf2 = await token.balanceOf(receiver);
      balanceOf2.toString().should.equal(tokens(100));
    });

    it('emits a transfer event', async () => {
      const log = result.logs[0];
      log.event.should.equal('Transfer');
      const event = log.args;
      event.from.toString().should.equal(deployer, 'from is correct');
      event.to.toString().should.equal(receiver, 'to is correct');
      event.value
        .toString()
        .should.equal(amount.toString(), 'value is correct');
    });
  });

  describe('failure', () => {
    let amount;
    let result;
    beforeEach(async () => {
      amount = tokens(100);
      token = await Token.new();
      result = await token.transfer(receiver, amount, { from: deployer });
    });

    it('rejects insufficient balance', async () => {
      let invalidAmount = tokens(100000000); // 100 million greater than total supply
      await token
        .transfer(receiver, invalidAmount, { from: deployer })
        .should.be.rejectedWith(EVM_REVERT);

      invalidAmount = tokens(10);
      await token
        .transfer(deployer, invalidAmount, { from: receiver })
        .should.be.rejectedWith(EVM_REVERT);
    });
  });
});

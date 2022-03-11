const Token = artifacts.require('./Token');
require('chai').use(require('chai-as-promised')).should();

const tokens = (n) => web3.utils.toWei(n.toString(), 'ether');
const EVM_REVERT = 'VM Exception while processing transaction: revert';

contract('Token', ([deployer, receiver, exchange]) => {
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

        await token
          .transfer(deployer, invalidAmount, { from: receiver })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it('rejects invalid recipients', async () => {
        let invalidAmount = tokens(100000000); // 100 million greater than total supply
        await token
          .transfer(0x0, invalidAmount, { from: deployer })
          .should.be.rejectedWith(
            'invalid address (argument="address", value=0, code=INVALID_ARGUMENT, version=address/5.0.5)'
          );
      });
    });
  });

  describe('approving tokens', () => {
    let amount;
    let result;
    beforeEach(async () => {
      amount = tokens(100);
      token = await Token.new();
      result = await token.approve(exchange, amount, { from: deployer });
    });

    describe('success', () => {
      it('allocate an allowance for delegated token spending on exchange', async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal(amount.toString());
      });

      it('emits an Approval event', async () => {
        const log = result.logs[0];
        log.event.should.equal('Approval');
        const event = log.args;
        event.owner.toString().should.equal(deployer, 'owner is correct');
        event.spender.toString().should.equal(exchange, 'to is correct');
        event.value
          .toString()
          .should.equal(amount.toString(), 'value is correct');
      });
    });

    describe('failure', () => {
      it('rejects invalid spenders', async () => {
        await token.approve(0x0, amount, { from: deployer }).should.be.rejected;
      });
    });
  });

  describe('delegated token transfers', () => {
    describe('success', () => {
      let amount;
      let result;

      beforeEach(async () => {
        amount = tokens(100);
        await token.approve(exchange, amount, { from: deployer });
      });
      beforeEach(async () => {
        result = await token.transferFrom(deployer, receiver, amount, {
          from: exchange,
        });
      });

      it('transfers token balances', async () => {
        const balanceOf1 = await token.balanceOf(deployer);
        balanceOf1.toString().should.equal(tokens(999900));
        const balanceOf2 = await token.balanceOf(receiver);
        balanceOf2.toString().should.equal(tokens(100));
      });

      it('resets the allowance', async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal('0');
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
      it('rejects insufficient amount', async () => {
        let invalidAmount = tokens(100000000); // 100 million greater than total supply
        await token
          .transferFrom(deployer, receiver, invalidAmount, { from: exchange })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });
});

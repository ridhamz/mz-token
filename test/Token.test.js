const Token = artifacts.require('./Token');
require('chai').use(require('chai-as-promised')).should();

contract('Token', (accounts) => {
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
      const result = await token.balanceOf(accounts[0]);
      result.toString().should.equal(totalSupply);
    });
  });

  describe('sending tokens', () => {
    it('transfers token balances', async () => {
      let balanceOf = await token.balanceOf(accounts[0]);
      console.log('deployer ', balanceOf.toString());
      balanceOf = await token.balanceOf(accounts[1]);
      console.log('reciever ', balanceOf.toString());

      // transfer
      await token.transfer(accounts[1], '1000', { from: accounts[0] });

      balanceOf = await token.balanceOf(accounts[0]);
      console.log('deployer ', balanceOf.toString());
      balanceOf = await token.balanceOf(accounts[1]);
      console.log('reciever ', balanceOf.toString());
    });
  });
});

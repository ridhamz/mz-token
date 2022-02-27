// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
//import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Token {
   // using SafeMath for uint;
    string public name = 'mz-token';
    string public symbol = 'MZ';
    uint256 public decimals = 18;
    uint256 public totalSupply;

     // track balances 
    mapping(address => uint256) public balanceOf;

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals) ;
        balanceOf[msg.sender] = totalSupply;
    }

    // send tokens
    function transfer(address _to, uint256 _value) public returns (bool success){
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        return true;
    }

     
}
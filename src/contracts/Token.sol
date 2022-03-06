// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Token {
    using SafeMath for uint;
    string public name = 'mz-token';
    string public symbol = 'MZ';
    uint256 public decimals = 18;
    uint256 public totalSupply;

     // track balances 
    mapping(address => uint256) public balanceOf;

    // events
    event Transfer(address indexed from, address to, uint256 value);

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals) ;
        balanceOf[msg.sender] = totalSupply;
    }

    // send tokens
    function transfer(address _to, uint256 _value) public returns (bool success){
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

     
}


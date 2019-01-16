pragma solidity ^0.4.0;

import "./Ownable.sol";

contract WeToken is Ownable {
    string public name      = "WeToken";
    string public symbol    = "WT";    
    uint24 public totalWT   = 100000 ;
    uint8  public decimals  = 17     ; // 1ETH = 10WT
    uint   public balanceWT = 100000 ;
    uint   public WTPrice   = 10 ** 17;
    uint   public salesStatus;
    uint   public startTime;
    uint   public deadline;
    
    mapping (address => uint) public balanceOf;

    constructor (uint _salesMinutes) public{   
        startTime = now;
        deadline  = startTime + _salesMinutes * 1 minutes;
    }        

    event Transfer(address indexed _from, address indexed _to, uint _value, uint _time);

    modifier meetDeadline() {
        require(now < deadline);
        _;
    }

    function transfer(address _to, uint _value) public{
        require(balanceOf[msg.sender] >= _value);                
        balanceOf[msg.sender] -= _value;                    
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value, now);
    }

    function transferFrom(address _from, address _to, uint _value) public{
        require(balanceOf[_from] >= _value);                
        balanceOf[_from] -= _value;                    
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value, now);
    }

    function () payable external meetDeadline {
        uint amountWT = msg.value / WTPrice;
        require(balanceWT >= amountWT );
        balanceOf[msg.sender]+= amountWT;
        salesStatus+=amountWT;
        balanceWT -= amountWT;
    }  

    function withdraw(uint _amount) onlyOwner public{ 
        require(now > deadline); 
        msg.sender.transfer(_amount);
    }
    
    function refunds() public meetDeadline {
        balanceWT += balanceOf[msg.sender];
        salesStatus -= balanceOf[msg.sender];
        uint ethValue = (balanceOf[msg.sender] * WTPrice);
        balanceOf[msg.sender] = 0;
        msg.sender.transfer(ethValue);
    }

    function killcontract() onlyOwner public {
        selfdestruct(owner);
    }
}


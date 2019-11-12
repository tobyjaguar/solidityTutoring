//Splitter
//there are 3 people: Alice, Bob and Carol
//we can see the balance of the Splitter contract on the web page
//whenever Alice sends ether to the contract, half of it goes to Bob and the other half to Carol
//we can see the balances of Alice, Bob and Carol on the web page
//we can send ether to it from the web page

pragma solidity ^0.5.10;

contract Splitter {

  mapping(address => uint256) public balances;

  event LogSplitMembers(
    address sender,
    address splitAddress1,
    address splitAddress2,
    uint256 splitAmount
  );
  event LogRequestWithdraw(address recipient, uint256 amount);

  constructor()
    public
  {
      //owner = msg.sender;
  }

  function splitMembers(address _split1, address _split2)
  public
  payable
  returns(bool success)
  {
      // checks to make sure this transaction will work correctly
      require(msg.sender != address(0));
      require(_split1 != address(0));
      require(_split2 != address(0));
      require(msg.value > 0);

      // account for odd amounts after splitting
      uint256 amount = msg.value/2;
      balances[_split1] += msg.value - amount;
      balances[_split2] += amount;

      // emit an event when a split accounts
      emit LogSplitMembers(msg.sender, _split1, _split2, msg.value/2);
      return true;
  }

  function requestWithdraw()
  public
  returns(bool success)
  {
      // safe withdraw structure to protect against re-entrancy
      uint256 amountToSend = balances[msg.sender];
      require(amountToSend != 0);
      balances[msg.sender] = 0;
      msg.sender.transfer(amountToSend);

      // emit an event when a withdraw is executed
      emit LogRequestWithdraw(msg.sender, amountToSend);
      return true;
  }

}

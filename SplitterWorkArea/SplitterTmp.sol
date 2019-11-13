pragma solidity ^0.5.0;

contract Ownable {
  // <-***implement***
}

contract Stoppable {

    // Import Ownable & use modifiers for both functions

    bool private _stopped;

    constructor()
    internal
    {
        _stopped = false;
    }

    modifer whenNotPaused() {
      require(!_stopped, "Contract is paused."); // _stopped = true -> !true
      _;
    }

    function stop()
    private
    returns (bool)
    {
        require(msg.sender == owner, "Only owner can call whenNotPaused.");
        _stopped = true;
    }

    function resume()
    private
    {
        _stopped = false;
    }
}

contract SplitterTmp is Ownable, Stoppable {

    using SafeMath for uint256;

    address payable public owner;
    address payable public alice;
    address payable public bob;
    address payable public carol;

    event Split(address indexed _sender, uint256 indexed _amount);
    event WithdrawCalled(address _withdrawer, uint _withdrawAmount);
    mapping(address => uint256) public balances;

    constructor(address payable _alice, address payable _bob, address payable _carol)
    public
    whenNotPaused
    {
        owner = msg.sender;
        alice = _alice;
        bob = _bob;
        carol = _carol;
    }

    function split()
    public
    payable
    whenNotPaused
    {
        require(alice != address(0x0) && bob != address(0x0) && carol != address(0x0), "Address can not be 0!");
        require(msg.value > 0, "Error: Value can not equal 0");
        require(msg.sender == alice);
        uint256 splitAmount = msg.value.div(2);
        balances[bob] = balances[bob].add(msg.value - splitAmount);
        balances[carol] += splitAmount; // <-***implement***
        emit Split(msg.sender, splitAmount);
    }

    // <-*** deimplement***
    function getBalance(address _address)
    public
    view
    returns(uint)
    {
        return balances[_address];
    }
    // <-*** deimplement***
    function contractBalance()
    public
    view
    returns (uint256)
    {
        return address(this).balance;
    }

    function withdraw(uint withdrawAmount)
    public
    whenNotPaused
    {
        // <-***implement***
        require(withdrawAmount > 0);
        require(withdrawAmount <= balances[msg.sender]);
        balances[msg.sender] -= withdrawAmount; // <-***implement***
        msg.sender.transfer(withdrawAmount);
        emit WithdrawCalled(msg.sender, withdrawAmount);
    }

    /// Withdraw a bid that was overbid.
    function withdraw() public returns (bool) {
    uint amount = balances[msg.sender]; // 50
    if (amount > 0) {
        // It is important to set this to zero because the recipient
        // can call this function again as part of the receiving call
        // before `send` returns.
        balances[msg.sender] = 0; // 0

        if (!msg.sender.send(amount)) { // -> 50
            // No need to call throw here, just reset the amount owing
            balances[msg.sender] = amount;
            return false;
        }
    }
    return true;
    }

}

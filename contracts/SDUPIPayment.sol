
contract SDUPIPayment {
    event PaymentSent(address from, address to, uint amount, uint timestamp);
    
    function sendPayment(address to, uint amount) public {
        require(amount > 0, "Amount must be positive");
        emit PaymentSent(msg.sender, to, amount, block.timestamp);
    }
    
    function batchPayment(address[] memory recipients, uint[] memory amounts) public {
        require(recipients.length == amounts.length, "Arrays must match");
        for(uint i = 0; i < recipients.length; i++) {
            emit PaymentSent(msg.sender, recipients[i], amounts[i], block.timestamp);
        }
    }
}
        
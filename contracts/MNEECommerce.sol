// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract MNEECommerce {
    IERC20 public mnee;
    address public owner;
    uint256 public constant REFUND_WINDOW = 7 days;

    struct Order {
        address buyer;
        uint256 amount;
        uint256 timestamp;
        bool refunded;
    }

    mapping(uint256 => Order) public orders;
    uint256 public orderCount;

    event OrderPlaced(uint256 orderId, address buyer, uint256 amount);
    event OrderRefunded(uint256 orderId);

    constructor(address _mnee) {
        mnee = IERC20(_mnee);
        owner = msg.sender;
    }

    function buy(uint256 amount) external {
        require(amount > 0, "Invalid amount");

        mnee.transferFrom(msg.sender, address(this), amount);

        orders[++orderCount] = Order({
            buyer: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            refunded: false
        });

        emit OrderPlaced(orderCount, msg.sender, amount);
    }

    function refund(uint256 orderId) external {
    Order storage order = orders[orderId];

    require(order.buyer == msg.sender, "Not your order");
    require(!order.refunded, "Already refunded");

    order.refunded = true;

    require(
        mnee.transfer(order.buyer, order.amount),
        "Refund failed"
    );

    emit OrderRefunded(orderId);
}



    
}

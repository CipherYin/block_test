pragma solidity ^0.4.24;

contract CourseList{
    address public ceo;
    constructor() public{
        //设置为合约的执行者
        ceo = msg.sender;
    }
}
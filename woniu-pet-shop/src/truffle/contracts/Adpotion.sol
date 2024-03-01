pragma solidity ^0.5.16;


contract Adpotion{
    //存储宠物主人地址
    address[16] public adopters;

    function adopt(uint petId) public returns(uint){
        //断言;
        require(petId>=0&&petId<16);
        adopters[petId] = msg.sender;
    }

    function getAdopters() public view returns(address[16] memory){
        return adopters;
    }
}
pragma solidity ^0.4.24;

contract CourseList{
    address public ceo;
    address[] public courses;
    constructor() public{
        //设置为合约的执行者
        ceo = msg.sender;
    }

    function createCourse(address _owner,string _name,string _content,uint _target,
                uint _fundingPrice,uint _price,string _img,string _video,bool _isOnline,uint _count) public {
        address newCourse = new Course(ceo,_owner,_name,_content,_target,_fundingPrice,
                                _price,_img,_video,_isOnline,_count);
        courses.push(newCourse);
    }

    //获取课程的所有地址
    function getCourse() public view returns(address[]){
        return courses;
    }
      //删除课程
    function removeCourse(uint _index) public{
        //只有ceo能删除
        require(msg.sender == ceo);
        //根据索引删除
        require(_index < courses.length);
        // 将要删除的课程地址置为空地址
        courses[_index] = address(0);
        // 删除最后一个元素
        uint lastIndex = courses.length - 1;
        courses[_index] = courses[lastIndex];
        delete courses[lastIndex];
        // 调整数组长度
        courses.length--;
    }
    function isCeo() public view returns(bool) {
        return msg.sender==ceo;
    }
}


contract Course{
    address public ceo;
    // 课程创建者
    address public owner;
    // 课程名
    string public name;
    // 课程简介
    string public content;
    // 课程目标募资
    uint public target;
    // 纵筹价格
    uint public fundingPrice;
    // 上线价格
    uint public price;
    // 课程头图
    string public img;
    // 视频
    string public video;
    // 是否上线
    bool public isOnline;
    //多少人支持
    uint public count;
    //用户购买信息
    mapping(address=>uint) public users;

    constructor(address _ceo,address _owner,string _name,string _content,uint _target,
                uint _fundingPrice,uint _price,string _img,string _video,bool _isOnline,uint _count) public{
            ceo = _ceo;
            owner = _owner;
            name = _name;
            content = _content;
            target = _target;
            fundingPrice = _fundingPrice;
            price = _price;
            img = _img;
            video = _video;
            isOnline = _isOnline;
            count = _count;
    }

     //纵筹或者购买
    function buy() public payable {
        //1. 用户没有购买过
        require(users[msg.sender]==0);
        if(isOnline){
            //如果上线了，必须得用上线价格购买
            require(price == msg.value);
        }else{
            //如果没上线了，必须得用纵筹价格购买
            require(fundingPrice == msg.value);
        }
        users[msg.sender] = msg.value;
        //统计人数
        count +=1;
        if(target <= count*fundingPrice){
            //钱超出目标
            if(isOnline){
                    //分成
                    uint value = msg.value;
                    ceo.transfer(value/10);
                    owner.transfer(value-value/10);
            }else{
                //没上线；第一次超出
                isOnline = true;
                //转账
                //上线之前的钱，都在合约内部，纵筹者是拿不到的
                owner.transfer(count*fundingPrice);
            }
        }
        
    }
    function addVideo(string _video) public{
        require(msg.sender == owner);
        require(isOnline==true);
        video = _video;
    }
    //获取详情
    function getDetail() public view returns(string,string,uint,uint,uint,string,string,uint,bool,uint){
        uint role ;
        if(owner==msg.sender){
            role = 0 ;//课程创建者
        }else if(users[msg.sender]>0){
            //已购买
            role=1;
        }else{
            //没买
            role=2;
        }
        return (
            name,
            content,
            target,
            fundingPrice,
            price,
            img,
            video,
            count,
            isOnline,
            role
        );
    }
}
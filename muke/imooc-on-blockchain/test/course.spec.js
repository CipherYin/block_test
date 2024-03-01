const path = require('path')
const assert = require('assert')
const {Web3} = require("web3");
console.log("Version:",Web3.version);

const ganache = require('ganache-cli');
//  测试驱动开发课程添加功能

const web3 = new Web3(ganache.provider(), null, { transactionConfirmationBlocks: 1 });

// 引入合约的json
const CourseList = require(path.resolve(__dirname,"../src/compiled/CourseList.json"));
const Course = require(path.resolve(__dirname,"../src/compiled/Course.json"));
// 定义几个全局变量，所有测试都需要
let accounts

//实例
let courseList
let course

describe('测试课程的智能合约',()=>{
    before(async ()=>{
        // 测试前的数据初始化
        accounts = await web3.eth.getAccounts()
        // console.log(accounts)
        // console.log(CourseList)
        // console.log(CourseList[':CourseList'].interface)
        // 1. 虚拟部署一个合约
        courseList = await new web3.eth.Contract(JSON.parse(CourseList[':CourseList'].interface))
                    .deploy({
                        data: CourseList[':CourseList'].bytecode
                    }).send({
                        // 最后一个是合约创建者
                        from: accounts[9],
                        gas: '5000000'
                    })
        
        console.log(courseList)
    })
    it("合约部署成功",()=>{
        assert.ok(courseList.options.address)
    })
    it("测试添加课程",async()=>{
        await courseList.methods.createCourse("蜗牛的React课程")
                .send({
                    //课程创建者
                    from: accounts[0],
                    gas: 0
                })
        const address = await courseList.methods.getCourse().call()
        assert.equal(address.length,1)
    })
    // it('测试1+2等不等于2',()=>{
    //     assert.equal(1+1,2)
    // })
})



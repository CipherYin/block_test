1. truffle相当于create-react-app或者vue-cli
2. 一开始用没问题，但是想进阶，还是需要自己配置一下webpack


1. 使用js测试合约，测试驱动开发


需要外部调用，声明为public

solc模块: 编译.sol文件， 生成一个json  (后面部署 测试 等需要的数据)
    1.bytecode 部署合约用的数据
    2. interface接口声明
        1.测试使用

1. 每次compile清空文件，重新生成
2. 报错信息打印
3. 最好能监听，自动compile
    1. 使用onchange模块


1. 课程列表
    1. 每一个课程 是一个单独的合约
    2. 使用 CourseList 来控制课程的合约

测试 使用mocha
断言使用node自己的assert
本地部署环境 ganache-cli 测试的时候开虚拟环境

课程字段：owner：课程创建者；name:课程名；content:课程简介;target: 课程目标的募资多少；ETH
        fundingPrice: 众筹价格
        price: 上线价格
        img: 课程头图
        video: 视频
        count：多少人支持
        isOnline: 是否上线
        users{
            用户1: 1块钱
            用户2: 2块钱
        }

payable可付款

1. 如果收到的钱大于目标 上线了
2. 上线前的钱 ceo不分 
3. 上线后的钱 ceo分一成


wei finney szabo ether
1 ether == 10^3 finney
1 ether == 10^6 szabo
1 ether == 10^18 wei

主网：以太坊
本地ganache: 没有 办法 在公网访问
ropsten等测试网 和主网一样的逻辑，只不过币不值钱

2. 部署
3. infura.io 部署服务

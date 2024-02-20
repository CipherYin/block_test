// 1. 迷你区块链
//     区块链的生成，新增，校验
//     交易
//     非对称加密
//     挖矿
//     p2p网络

// [
//     {
//         index: 0,索引,
//         timestamp: 时间戳
//         data:区块链的具体信息，主要是交易信息
//         hash: 当前区块的哈希
//         prevHash: 上一个区块的哈希 哈希0
//         nonce: 随机数,
//     }
// ]

const crypto = require('crypto')
const dgram = require('dgram')
const rsa = require('./rsa')
// 创世区块
const initBlock =  {
    index: 0,
    data: 'Hello woniu-chain!',
    prevHash: '0',
    timestamp: 1536622963141,
    nonce: 50466,
    hash: '0000e516744b117ced4a20e1c4060259ecc70a609e1a14b3c19ee0e5dbc29cca'
  }
class Blockchain{
    constructor(){
        this.blockchain = [
            initBlock
        ]
        this.data = []
        // 区块的难度
        this.difficulty=4
        // 所有网络节点信息
        this.peers = []
        this.remote={}
        // 种子节点
        this.seed = {port: '0001',address:'localhost'}
        this.udp = dgram.createSocket('udp4')
        this.init()
        }
    init(){
        this.bindP2p()
        this.bindExit()
    }
    bindP2p(){
        // 处理网络发来的信息，数据，远端地址
        this.udp.on('message',(data,remote)=>{
            const {address,port} = remote
            console.log('来消息了')
            const action = JSON.parse(data)
            // {
            //     "type":"要干啥",
            //     data:真实传递信息
            // }
            if(action.type){
                this.dispatch(action,{address,port})
            }
        }) 
        this.udp.on('listening',()=>{
            const address = this.udp.address()
            console.log('[信息]：udp监听完毕 端口是: ',address.port)
        }) 
        //区分种子节点和普通节点；普通节点端口不固定；种子节点端口约定好
        console.log(process.argv)
        const port = Number(process.argv[2]) || 0
        this.startNode(port)
    }
    bindExit(){
        process.on("exit",()=>{
            console.log("[信息]：退出")
        })
    }
    boardcast(action){
        this.peers.forEach(v=>{
            this.send(action,v.port,v.address)
        })
    }
    dispatch(action,remote){
        console.log('接受到P2p网络的消息',action)
        //接受到网络的消息在这里处理
        switch(action.type){
            case "newpeer":
                //种子节点要做的事情
                //1. 你的公网ip和port是啥
                this.send({
                    type: 'remoteAddress',
                    data: remote
                },remote.port,remote.address)
                //2. 现在全部节点的列表
                this.send({
                    type: 'peerlist',
                    data: this.peers
                },remote.port,remote.address)
                //3. 告诉所有已知节点 来了个新朋友 快打招呼
                this.boardcast({
                    type: 'sayhi',
                    data: remote
                })
                //4. 告诉你现在区块链的数据
                this.send({
                    'type':'blockchain',
                     'data': JSON.stringify({
                        blockchain: this.blockchain,
                        trans: this.data
                     },remote.port,remote.address)
                })
                console.log("你好啊，新朋友，请你喝茶",remote)
                break
            case 'blockchain':
                // 同步本地链
                let allData = JSON.parse(action.data)
                let newChain = allData.blockchain
                let newTrans = allData.newTrans

                this.replaceChain(newChain)
                this.replaceTrans(newTrans)
            case "remoteAddress":
                // 存储远程消息，退出的时候用
            case "peerlist":
                // 远程告诉我，现在的节点列表
                const newPeers = action.data
                this.addPeers(newPeers)
            case 'sayhi':
                let remotePeer = action.data
                this.peers.push(remotePeer)
                console.log('[信息]: 新朋友你好,相识就是缘')
                this.send({
                    type: 'hi'
                },remotePeer.port,remotePeer.addPeers)
            case 'trans':
                //网络上收到交易请求
                //是不是重复交易
                if(!this.data.find(v=>this.isEqualObj(v,action.data))){
                      console.log('新的交易请注意查收')  
                      this.addTrans(action.data)
                      this.boardcast({
                        type: 'trans',
                        data: action.data
                      })
                }
                break
            case 'hi':
                console.log(`${remote.address}:${remote.port}:${action.data}`)
            case 'mine':
                //网络上有人挖矿成功
                const lastBlock = this.getLastBlock()
                if(lastBlock.hash===action.data.hash){
                    //重复的消息
                    return
                }
                if(this.isValidBlock(action.data,lastBlock)){
                    console.log('[信息]: 有朋友挖矿成功')
                    this.blockchain.push(action.data)
                    // 清空本地消息
                    this.data=[]
                    this.boardcast({
                        type: 'mine',
                        data: action.data
                    })
                }else{
                    console.log('[错误]: 挖矿不合法')
                }
                break
            default:
                console.log('我来了')
        }
    }
    isEqualObj(obj1,obj2){
        const key1 = Object.keys(obj1)
        const key2 = Object.keys(obj2)
        if(key1.length!==key2.length){
            //key数量不同
            return false
        }
        return key1.every(key=>obj1[key]===obj2[key])
    }
    isEqualPeer(peer1,peer2){
        return peer1.address == peer2.address &&peer1.port == peer2.address
    }
    addPeers(peers){
       this.peers.forEach(peer=>{
            //新节点如果不存在，就添加一个到peers
            if(!this.peers.find(v=>this.isEqualPeer(peer,v))){
                    this.peers.push(peer)
            }
        })
    }
    addTrans(trans){
            if(this.isValidTransfer(trans)){
                this.data.push(trans)
            }
    }
    
    startNode(port){
        this.udp.bind(port)
        console.log('startNode ')
        // 如果不是种子节点，需要发送一个消息告诉种子，我来了
        if(port!==8001){
            this.send({
                type: 'newpeer',
               
            },this.seed.port,this.seed.address)
            //把种子节点加入到本地节点
            this.peers.push(this.seed)
        }
        
    }
    send(message,port,address){
        console.log('send',message,port.address)
        this.udp.send(JSON.stringify(message),port,address)
    }
    //获取 最新区块
    getLastBlock(){
        return this.blockchain[this.blockchain.length-1]
    }
    //查询余额
    blance(address){
        //from to amount
        let blance = 0
        this.blockchain.forEach(block=>{
            block.data.forEach(trans=>{
                if(address == trans.from){
                    blance-=trans.amount
                }
                if(address==trans.to){
                    blance += trans.amount
                }
            })
        })
        return blance
    }
    isValidTransfer(trans){
        return rsa.verify(trans,trans.from)
    }
    // 挖矿 ->就是打包交易
    mine(address){
        // //交易合法性
        // if(!this.data.every(v=>this.isValidTransfer(v))){
        //     console.log('trans not valid')
        //     return
        // }
        this.data = this.data.filter(v=>this.isValidTransfer(v))
        //挖矿结束，矿工奖励
        this.transfer('0',address,100)
        const newBlock = this.generateNewBlock()  
        //区块合法，并且区块链合法，就新增一下
        if(this.isValidBlock(newBlock) && this.isValidChain(this.blockchain)){
            this.blockchain.push(newBlock)
            this.data = []
            console.log('[信息] 挖矿成功')
            this.boardcast({
                type: 'mine',
                data: newBlock
            })
            return newBlock
        }else{
            console.log('Error,  inValid Block',newBlock)
        }
        
    }

    //生产新区块
    generateNewBlock(){
                //1. 生成新区块 一页新的记账加入了区块链
                //2. 不停的计算hash,直到计算出符合条件的哈希值，获得记账权
        let nonce = 0 //随机数
        const index = this.blockchain.length // 区块索引值
        const data = this.data
        const prevHash = this.getLastBlock().hash
        let timestamp = new Date().getTime()
        let hash = this.computeHash(index,prevHash,timestamp,data,nonce)
        while(hash.slice(0,this.difficulty)!=='0'.repeat(this.difficulty)){
            nonce+=1
            hash = this.computeHash(index,prevHash,timestamp,data,nonce)
        }
        return {
            index,
            data,
            prevHash,
            timestamp,
            nonce,
            hash
        }
    }
    computeHashForBlock({index,prevHash,timestamp,data,nonce}){
        return this.computeHash(index,prevHash,timestamp,data,nonce)
    }
    // 计算哈希
    computeHash(index,prevHash,timestamp,data,nonce){
        return crypto
        .createHash('sha256')
        // 想要生成的hash的字符串
        .update(index+prevHash+timestamp+data+nonce)
        //最后的输出形式
        .digest('hex')
    }
    //交易转账
    transfer(from,to,amount){
        const timestamp = new Date().getTime()
        const signature  = rsa.sign({from,to,amount,timestamp})
        const sigTrans = {from,to,amount,timestamp,signature}
        // 签名校验=>后面完成
        if(!from!=='0'){
            //交易非挖矿
            const blance = this.blance(from)
            if(blance<amount){
                console.log('not enough blance',from,blance,amount)
                return 
            }
            this.boardcast({
                type: 'trans',
                data: sigTrans
            })
        }
        this.data.push(sigTrans)
       
        return sigTrans
    }

    // 校验区块
    isValidBlock(newBlock,lastBlock =  this.getLastBlock()){
        //1. 区块的index等于最新区块的index+1
        //2. 区块的time大于最新的区块
        //3. 最新区块的prevHash等于最新区块的Hash
        //4. 区块的哈希值符合难度要求
        //5.新区块的哈希值计算正确
        if(newBlock.index !== lastBlock.index+1){
            return false
        }else if(newBlock.timestamp<=lastBlock.timestamp){
            return false
        }else if(newBlock.prevHash !== lastBlock.hash){
            return false
        }else if(newBlock.hash.slice(0,this.difficulty)!=='0'.repeat(this.difficulty)){
            return false
        }else if(newBlock.hash!=this.computeHashForBlock(newBlock)){
            return false
        }
        return true
    }
    // 校验区块链
    isValidChain(chain=this.blockchain){
        for(let i=chain.length-1;i>=1;i--){
            if(!this.isValidBlock(chain[i],chain[i-1])){
                return false
            }
        }
        if(JSON.stringify(chain[0])!=JSON.stringify(initBlock)){
            return false
        }
        return true

    }

    replaceChain(newChain){
        // 先不校验交易
        if(newChain.length===1){
            return
        }
        if(this.isValidChain(newChain) && newChain.length>this.blockchain.length){
            this.blockchain = JSON.parse(JSON.stringify(newChain))
        }else{
            console.log('[错误]: 不合法链')
        }
    }
    replaceTrans(trans){
        if(trans.every(v=>this.isValidTransfer(v))){
            this.data = trans
        }
    }
}

module.exports = Blockchain
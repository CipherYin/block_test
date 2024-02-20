// 加密 安全
// RSA非对称加密

// 公钥（所有人都知道） 私钥（只有你自己知道）
// 用私钥加密信息，用公钥验证信息是否合法

// 矿工打包的时候，会进行每个交易的合法校验
    //1. sign是签名校验合法
    //2. 账号的余额够不够
// 1. 公私钥对
// 2. 公钥直接当成地址用（或者截取公钥前20位）
//3. 公钥可以根据私钥算出来
let EC = require('elliptic').ec
let ec = new EC("secp256k1")
let keypair = ec.genKeyPair()
let fs = require('fs')

const res = {
    prv: keypair.getPrivate('hex').toString(),
    pub: keypair.getPublic('hex').toString(),
}
let keys = generateKeys()
function getPub(prv){
    return ec.keyFromPrivate(prv).getPublic('hex').toString
}
//1. 获取公私钥对（持久化）
function generateKeys(){
    const fileName = './wallet.json'
    try{
        let res = JSON.parse(fs.readFileSync(fileName))
        if(res.prv && res.pub && getPub(res.prv)==res.pub){
            keypair = ec.keyFromPrivate(res.prv)
            return res
        }else{
            throw "not valid wallet.json"
        }
    }catch(error){
        // 文件不存在 或者 文件内容不合法  c重新生成
        const res = {
            prv: keypair.getPrivate('hex').toString(),
            pub: keypair.getPublic('hex').toString(),
        }
        fs.writeFileSync(fileName,JSON.stringify(res))
        return res;
    }


}
//2. 签名
function sign({from,to,amount,timestamp}){
    let bufferMsg = Buffer.from(`${timestamp}-${amount}-${from}-${to}`)
    let signature = Buffer.from(keypair.sign(bufferMsg).toDER()).toString('hex')
    return signature
}

//3. 校验签名
function verify({from,to,amount,timestamp,signature},pub){
    //校验是没有私钥的
    const keypairTemp = ec.keyFromPublic(pub,'hex')
    const bufferMsg = Buffer.from(`${timestamp}-${amount}-${from}-${to}`)
    return keypairTemp.verify(bufferMsg,signature)
}
module.exports={sign,verify,keys}

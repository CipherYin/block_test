// 文件模块
const fs = require('fs')

//路径模块
const path = require('path')
//solc模块
const solc = require('solc')

const contractPath = path.resolve(__dirname,'../contracts/imooc.sol')

//获取合约文件内容
const source = fs.readFileSync(contractPath,'utf-8')

//编译
const ret = solc.compile(source)

Object.keys(ret.contracts).forEach(name=>{
    const contractName = name.slice(1)
    const filePath = path.resolve(__dirname,`../src/compiled/${contractName}.json`)
    fs.writeFileSync(filePath,JSON.stringify(ret.contracts));
    console.log(`${filePath} bingo`)
})



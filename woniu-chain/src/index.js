const vorpal = require('vorpal')()
const Table = require('cli-table')
const Blockchain = require('./blockchain')
const blockchain = new Blockchain()

const table = new Table({
    head:[],
    colWidths:[]
})

table.push(
    [],
    []
)

function formatLog(data){
    if(!Array.isArray(data)){
        data = [data]
    }
    const first = data[0]
    const head = Object.keys(first)
    const table = new Table({
        head: head,
        colWidths: new Array(head.length).fill(15)
    });
    const res = data.map(v=>{
        //第三个参数换行符
        return head.map(h=>JSON.stringify(v[h],null,1))
    })
    table.push(...res)
    console.log(table.toString())
}

vorpal.command('mine <address>','挖矿')
      .action(function(args,callback){
        const newBlock = blockchain.mine(args.address)
        if(newBlock){
            formatLog(newBlock)
        }
        callback()
})
vorpal.command('chain','查看区块链')
      .action(function(args,callback){
        formatLog(blockchain.blockchain)
        callback()
})
vorpal.command('pub','查看本地地址')
      .action(function(args,callback){
        console.log(rsa.keys.pub)
        callback()
})
vorpal.command('peers','查看网络节点列表')
      .action(function(args,callback){
        formatLog(blockchain.peers)
        callback()
})
vorpal.command('trans <from><to><amount>','转账')
      .action(function(args,callback){
        let trans = blockchain.transfer(args.from,args.to,args.amount)
        formatLog(trans)
        callback()
})
vorpal.command('detail <index>','查看区块详情')
      .action(function(args,callback){
        const block = blockchain.blockchain[args.index]
        this.log(JSON.stringify(block))
        callback()
})
vorpal.exec('help')

vorpal.delimiter('woniu-chain=>')
        .show()
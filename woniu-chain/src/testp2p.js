const dgram = require('dgram')

const udp  =dgram.createSocket('udp4')

//udp 收信息
udp.on('message',(data,remote)=>{
    console.log('accept message'+data.toString())
    console.log(remote)
})
udp.on('listening',function(){
    const address = udp.address()
    console.log('udp server is listening'+address.address+":"+address.port)
})
udp.bind(8002)


const port = Number(process.argv[2])
const host = Number(process.argv[3])
if(port&&host){
    send('累好啊',port,host)
}
function send(message,port,host){
    console.log('send message',message,port,host)
    udp.send(Buffer.from(message),port,host)
}



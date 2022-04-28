const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;

//checking if environment variable PEERS exists and if it does then set it to return an array 
//of all websocket adresses or empty if its not present

const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS'
};

//HTTP_PORT = 3002 P2P_PORT = 5003 PEERS = ws://localhost:5001, ws://localhost:5002 npm run dev

class P2pServer {

    constructor(blockchain, transactionPool) {

        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen() {

        const server = new Websocket.Server({ port: P2P_PORT });

        //listening for connection events, fire specific code whenver a new socket connects to this server

        server.on('connection', socket => this.connectSocket(socket));

        this.connectToPeers();
        
        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
    }

    connectToPeers() {

        peers.forEach(peer => {

            //peer will be the address of the peer
            //with this we can make a new Websocket

            const socket = new Websocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        
           
        });
    }

    connectSocket(socket) {

        this.sockets.push(socket);
        console.log('Socket Connected: mbagz baggin...');

        this.messageHandler(socket);

        socket.send(JSON.stringify(this.blockchain.chain));

        this.sendChain(socket);
    }

    messageHandler(socket) {

        socket.on('message', message => {

            const data = JSON.parse(message);
            

            /*depending on the data type, either passing a chain or a transaction, carry out the appropriate action
            * activity is visible to all connected
            */
            switch(data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();    
                    break
            }
        });
    }

    sendChain(socket){
        socket.send(JSON.stringify({ 
            type: MESSAGE_TYPES.chain, 
            chain: this.blockchain.chain}));
    
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }
    
    //synchronizes the chains for everyone connected (all sockets)
    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    
    }
    //shows transactions for all connected
    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));

    }

    broadcastClearTrans() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }

}

module.exports = P2pServer;
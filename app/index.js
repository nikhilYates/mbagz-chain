const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');
const Transaction = require('../wallet/transactions');

const HTTP_PORT = process.env.HTTP_PORT || 3001;


const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool;
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);
const tstn = new Transaction();

//allows us to receive JSON post-request (res)
app.use(bodyParser.json());

//the first param is an endpoint that the API will expose + for arrow func, two params request and response
app.get('/blocks', (req, res) => {

    console.log(bc.chain); //displays on terminal: shows current blockchain, masks data under [object]
    
    res.json(bc.chain); //to send the JSON back to the user

});

//post-request method + mine is when users wanna add data to blockchain
app.post('/mine', (req, res) => {

    //assume a data field is present within body obj
    const block = bc.addBlock(req.body.data);

    //how to confirm/see new block
    console.log(`New block added ${block.toString()}`);

    //to sync all peers every time a mine occcurs (i.e., everytime a block gets added we need to 
    //show this updated chain for all users)
    p2pServer.syncChains();

    //respond to added block 
    res.redirect('/blocks');
});

app.get('/transactions', (req, res) => {
    res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, bc, tp);
    p2pServer.broadcastTransaction(transaction);
    console.log(tp.transactions);
    res.redirect('/transactions');
});

app.get('/mine-transactions', (req, res) => {
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    //lets us see the new block on the chain
    res.redirect('/blocks');
})

//allow users to see their public key so they can share it wit others, specify the user as recipient
app.get('/public-key', (req, res) => {
    console.log(`publicKey = ${wallet.publicKey}`);
    res.json({ publicKey: wallet.publicKey });
});

//let users check their current balance 
app.get('/balance', (req, res) => {
    let newWal;

    newWal = new Wallet();

    console.log(`Current balance = ${newWal.calculateBalance(bc)} bags.`);
    res.redirect('/transactions');

});

//now to check if app is running -> ${} is the port
app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen();

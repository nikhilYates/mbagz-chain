const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');

const HTTP_PORT = process.env.HTTP_PORT || 3001;


const app = express();
const bc = new Blockchain();
const p2pServer = new P2pServer(bc);

//allows us to receive JSON post-request (res)
app.use(bodyParser.json());

//the first param is an endpoint that the API will expose + for arrow func, two params request and response
app.get('/blocks', (req, res) => {
    
    res.json(bc.chain); //to send the JSON back to the user

});

//post-request method + mine is when users wanna add data to blockchain
app.post('/mine', (req, res) => {

    //assume a data field is present within body obj
    const block = bc.addBlock(req.body.data);

    //how to confirm/see new block
    console.log(`New block added ${block.toString()}`);

    //respond to added block 
    res.redirect('/blocks');
})

//now to check if app is running -> ${} is the port
app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen();

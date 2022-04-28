const Wallet = require('../wallet');
const Transaction = require('../wallet/transactions');


class Miner {

    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;

    }

    mine() {    
        const validTransactions = this.transactionPool.validTransactions();

        //need to include a reward for the miner - incentivize mining
        validTransactions.push(
            Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
        );

        //creae a block that holds valid transactions

        const block = this.blockchain.addBlock(validTransactions);
        //sync chains in the peer to peer server - everyone can see the current chains
        this.p2pServer.syncChains();
        //clear the transaction pool
        this.transactionPool.clear();
        //all miners clear their respective transaction pools
        this.p2pServer.broadcastClearTrans();

        return block

    }
}

module.exports = Miner;
const ChainUtil = require('../chain-util');
const Transaction = require('./transactions');
const { INITIAL_BALANCE } = require('../config');

class Wallet {


    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {

        return `Wallet - 
            publicKey: ${this.publicKey.toString()}
            balance  : ${this.balance}`
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    createTransaction(recipient, amount, blockchain, transactionPool) {

        this.balance = this.calculateBalance(blockchain);
        if(amount > this.balance) {
            console.log(`Amount ${amount} exceeds the current balance: ${this.balance}`);
            return;
        }

        //does this transaction exist? depending on the given public key
        let transaction = transactionPool.existingTransaction(this.publicKey);

        //either contains something (exists) or is undefined 
        if(transaction) {
            transaction.update(this, recipient, amount);

        } else {
            
            //if it doesnt exist, create a new transaction
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateAddTransaction(transaction);

        }

        return transaction;
    }

    // calculateBalance(blockchain) {
    //     let balance = this.balance;
    //     let transactions = [];
        
    //     blockchain.chain.forEach(block => block.data.forEach(transaction => {
    //         transactions.push(transaction);
    //     }));

    //     const walletInpTrans = transactions.filter(transaction => transaction.input.address === this.publicKey);
    
    //     let startTime = 0;

    //     if(walletInpTrans.length > 0) {
    //         const recentInpTrans = walletInpTrans.reduce(
    //             (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
    //         );
    //         balance = recentInpTrans.outputs.find(output => output.address === this.publicKey).amount;
    //         startTime = recentInpTrans.input.timestamp;
    //     }

    //     transactions.forEach(transaction => {
    //         if(transaction.input.timestamp > startTime) {
    //             transaction.outputs.find(output => {
    //                 if(output.address === this.publicKey) {
    //                     balance += output.amount;
    //                 }
    //             });
    //         }
    //     });

    //     return balance;

    // }
    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];
        blockchain.chain.forEach(block => block.data.forEach(transaction => {
          transactions.push(transaction);
        }));
    
        const walletInputTs = transactions
          .filter(transaction => transaction.input.address === this.publicKey);
    
        let startTime = 0;
    
        if (walletInputTs.length > 0) {
          const recentInputT = walletInputTs.reduce(
            (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
          );
    
          balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
          startTime = recentInputT.input.timestamp;
        }
    
        transactions.forEach(transaction => {
          if (transaction.input.timestamp > startTime) {
            transaction.outputs.find(output => {
              if (output.address === this.publicKey) {
                balance += output.amount;
              }
            });
          }
        });
    
        return balance;
      }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }

}

//share this class!
module.exports = Wallet;



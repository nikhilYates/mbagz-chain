//Collection of transactions

const Transaction = require("../wallet/transactions");

class TransactionPool {

    constructor() {
        this.transactions = [];
    }

    updateAddTransaction(transaction) {
        let transactionWithID = this.transactions.find(t => t.id === transaction.id);

        //if it exists
        if(transactionWithID) {
            this.transactions[this.transactions.indexOf(transactionWithID)] = transaction;
        
        } else {
            this.transactions.push(transaction);
        }
    }

    existingTransaction(address) {
        //looking through each t and checking if its address matches the current address
        return this.transactions.find(t => t.input.address === address);
    }

    validTransactions() {
        //look at each transaction object
        return this.transactions.filter(transaction => {
            const outputTotal = transaction.outputs.reduce((total, output) => {
                //reduces all transactions to one value
                return total + output.amount;
            //second parameter is the initial value (0)    
            }, 0);
            //check if the transaction amount is not equal to output total
            if(transaction.input.amount !== outputTotal) {
                console.log(`Invalid transaction from ${transaction.input.address}.`);
                return;
            }
            //check if signature of each transaction is false
            if(!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}.`);
                return
            }

            return transaction;

        });
    }

    //function to clear transaction pool
    clear() {
        this.transactions = [];
    }
}

module.exports = TransactionPool;
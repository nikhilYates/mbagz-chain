const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {

    constructor(timeStamp, lastHash, hash, data, nonce, difficulty) {

        this.timeStamp = timeStamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        //difficulty of each block depends on adjusting diff of block before: set first block diff to default
        this.difficulty = difficulty || DIFFICULTY;

    }

    toString() {

        return ` Block -
            TimeStamp  : ${this.timeStamp}
            LastHash   : ${this.lastHash.substring(0, 20)}
            Hash       : ${this.hash.substring(0, 20)}
            Nonce      : ${this.nonce}
            Difficulty : ${this.difficulty}
            Data       : ${this.data}`;
    }

    static genesis() {

        return new this('Genesis time', '-----', 'f1r57-h45h', [], 0, DIFFICULTY);
    }

    /*
    * Mine block function takes lastBlock and the data as parameters
    * calls on the toString function and returns the value of the mined block
    * */
    static mineBlock(lastBlock, data) {
        let hash, timeStamp;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;
        
        do {
            nonce++;
            timeStamp = Date.now();
            //Will work for every new block in the chain
            difficulty = Block.adjustDifficulty(lastBlock, timeStamp);
            hash = Block.hash(timeStamp, lastHash, data, nonce, difficulty);
        
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));
        
        return new this(timeStamp, lastHash, hash, data, nonce, difficulty);

    }

    static hash(timeStamp, lastHash, data, nonce, difficulty) {

        return ChainUtil.hash(`${timeStamp}${lastHash}${data}${nonce}${difficulty}`).toString();

    }

    static blockHash(block) {

        const { timeStamp, lastHash, data, nonce, difficulty } = block;
        return Block.hash(timeStamp, lastHash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime) {
        let { difficulty } = lastBlock;
         /*
        *if mine had difficulty x and a mine rate y but was mined in less than y, 
        *we need to increase difficulty and vice-versa:
        *Turnary expr
        */
        difficulty = lastBlock.timeStamp + MINE_RATE > currentTime ?
          difficulty + 1 : difficulty - 1;
        return difficulty;
      }

}

module.exports = Block;
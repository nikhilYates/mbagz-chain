const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const {v4: uuidv4} = require('uuid');

//sec = "standards of efficient cryptography" p = "prime", 256 bits, k = "koblitz", 1 = "first implementation of this algorithm in this program"
const ec = new EC('secp256k1');

class ChainUtil {

    static genKeyPair() {
        return ec.genKeyPair();
    }

    static id() {
        return uuidv4();
    }

    static hash(data) {
        return SHA256(JSON.stringify(data)).toString();
    }

    static verifySignature(publicKey, signature, dataHash) {

        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
    }
}

module.exports = ChainUtil;
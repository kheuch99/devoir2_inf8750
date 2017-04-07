var aesjs = require('aes-js');
var _ = require('underscore');
var jsSHA  = require('jssha');

// 128-bit key (16 bytes * 8 bits/byte = 128 bits)
const NB_BYTES = 16;
const NB_TIMES_TO_HASH = 1000;

/*
Cette fonction génère aléatoirement une chaine de caractère de longueur "length".
Dans ce cas ci, la chaine de caractère est générée de sorte à mesurer 128 bits.
@param: length, la longueur de la chaine de caractère à générer
@return: str, la chaine de caractère aléatoire
*/
function randomString(length) {
    var str = "";
    var range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        str += range.charAt(Math.floor(Math.random() * range.length));
    }

    return str;
}

/*
Cette fonction génère une paire pre_puzzle_key & secret_key accompagnée de son index.
@param: _index, l'index attribué à la paire générée
@return: un objet contenant la paire pre_puzzle_key & secret_key générée ainsi que l'index qui va avec
*/
function genPair(_index){
    var pre_puzzle_key = randomString(NB_BYTES);
    var secret_key = randomString(NB_BYTES);

    return {
        pre_puzzle_key : pre_puzzle_key,
        secret_key : secret_key,
        index : _index
    }
}

/*
Cette fonction génère N paires de pre_puzzle_key & secret_key accompagnée de leur index.
@param: N, le nombre de paires à générer
@return: un tableau contenant les paires pre_puzzle_key & secret_key générée ainsi que leur index
*/
function genPairs(N){
    var tab = new Array();
    for(i = 0; i < N ; i++){
        tab.push(genPair(i));
    }

    return tab;
}


/*
Cette fonction applique récursivement la fonction de hachage SHA-1 sur le "pre_puzzle_key" et ce "nbTimesToHash" fois.
Le résultat du hachage est tronqué de sorte à avoir une clé sous un tableau de 128bits (16 éléments).
@param: pre_puzzle_key, la chaine de caractère à hacher récursivement
@return: puzzle_key = SHA-1 ^ 1000(pre_puzzle_key)
*/
function genPuzzlegKey(pre_puzzle_key){  
    var hashMap = {numRounds : NB_TIMES_TO_HASH, encoding : "UTF8"}
    var shaObj = new jsSHA("SHA-1", "TEXT", hashMap);  
    shaObj.update(pre_puzzle_key);
    var hashedPrePuzzleKey = shaObj.getHash("ARRAYBUFFER");
    var table = _.toArray(hashedPrePuzzleKey);
    var hash = [];

    for(i = 0; i < NB_BYTES; i++){
        hash.push(table[i]);
    }

    return hash;
}

/*
Cette fonction génère un puzzle cryptographique. Pour ce faire le chiffrement symétrique AES est utilisé.
Le mode d'opération choisi parmi ceux proposés est le CTR.
@param: toEncrypt, le message à encrypter
@param: puzzle_key, la clé de 128bits utilisées pour l'encription
*/
function genPuzzle(toEncrypt, puzzle_key){
    var message = toEncrypt.secret_key.concat(toEncrypt.index);
    var messageBytes = aesjs.utils.utf8.toBytes(message);

    // The counter is optional, and if omitted will begin at 1
    var aesCtr = new aesjs.ModeOfOperation.ctr(puzzle_key, new aesjs.Counter(5));

    var encryptedBytes = aesCtr.encrypt(messageBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
}
 

// ----------------------------------- MAIN -----------------------------------

var obj = genPair(1);
var tab = genPuzzlegKey(obj.pre_puzzle_key); 
var puzzle = genPuzzle(obj, tab);

console.log(obj);
console.log("puzzle_key: " + tab + "\tsize: " + tab.length);
console.log("puzzle: " + puzzle + "\tsize: " + puzzle.length);

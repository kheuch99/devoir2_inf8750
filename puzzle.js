var aesjs = require('aes-js');
var _ = require('underscore');
var jsSHA  = require('jssha');

const N                = 5;       // Les n paires à générer
const NB_BYTES         = 16;        // 128-bit key (16 bytes * 8 bits/byte = 128 bits)
const NB_TIMES_TO_HASH = 1000;      // Le nombre de fois qu'on hash le pre_puzzle_key

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
function genPuzzleKey(pre_puzzle_key){
    var hashMap = {numRounds : NB_TIMES_TO_HASH, encoding : "UTF8"}
    var shaObj = new jsSHA("SHA-1", "TEXT", hashMap);  
    shaObj.update(pre_puzzle_key);
    var hashedPrePuzzleKey = shaObj.getHash("ARRAYBUFFER");
    var table = _.toArray(hashedPrePuzzleKey);
    var hash = [];

    for(var i = 0; i < NB_BYTES; i++){
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
function genPuzzle(secretKey, index, puzzle_key){
    var message = secretKey.concat(index);
    var messageBytes = aesjs.utils.utf8.toBytes(message);

    // The counter is optional, and if omitted will begin at 1
    var aesCtr = new aesjs.ModeOfOperation.ctr(puzzle_key, new aesjs.Counter(5));

    var encryptedBytes = aesCtr.encrypt(messageBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
}


// ----------------------------------- Class: Entité -----------------------------------
/*
Entity: les entités Alice & Bob du protocole.
*/
function Entity(message, size) {
    this.pairs = message;
    this.n = size;
    this.sendMsg = function(Entity) { Entity.pairs = message; Entity.n = size;};
    this.receiveMsg = function(message, n) { this.pairs = message; this.n = size;};
}

// ----------------------------------- MAIN -----------------------------------

// Etape 1: génération des n paires (pre_puzzle_key, secret_key, index)
var nPairs  = genPairs(N);

// Etape 2: génération des  n puzzles cryptographiques
var puzzles = [];
for(var i = 0; i < N; i++){
    var pre_puzzle_key = nPairs[i].pre_puzzle_key;
    var secret_key     = nPairs[i].secret_key;
    var index          = nPairs[i].index;

    var puzzle_key = genPuzzleKey(pre_puzzle_key);
    var puzzle     = genPuzzle(secret_key, index, puzzle_key);
    puzzles.push(puzzle);

    console.log("pre_puzzle_key: " + pre_puzzle_key + " secret_key: " + secret_key + " index: " + index);
    console.log("puzzle_key: " + puzzle_key + "\tsize: " + puzzle_key.length);
    console.log("puzzle " + i + " : " + puzzle + "\tsize: " + puzzle.length);
}

// Etape 3: envoi du message à Bob
var pairsToSend = [];
for(var i = 0; i < N; i++){
    var pre_puzzle_key = nPairs[i].pre_puzzle_key;
    var puzzle         = puzzles[i];

    pairsToSend.push({pre_puzzle_key: pre_puzzle_key, puzzle: puzzle});

    console.log("pre_puzzle_key " + i + " : " + pre_puzzle_key);
    console.log("puzzle " + i + " : " + puzzle + "\tsize: " + puzzle.length);
}

console.log("PairsToSend 0 : " + pairsToSend[0].pre_puzzle_key + " -> " + pairsToSend[0].puzzle);
console.log("PairsToSend 1 : " + pairsToSend[1].pre_puzzle_key + " -> " + pairsToSend[1].puzzle);
console.log("PairsToSend 2 : " + pairsToSend[2].pre_puzzle_key + " -> " + pairsToSend[2].puzzle);
console.log("PairsToSend 3 : " + pairsToSend[3].pre_puzzle_key + " -> " + pairsToSend[3].puzzle);
console.log("PairsToSend 4 : " + pairsToSend[4].pre_puzzle_key + " -> " + pairsToSend[4].puzzle);

// Création des entités du protocle
var Alice = new Entity(_.shuffle(pairsToSend), N);      // _.shuffle(list): pour permutter les éléments de la liste
var Bob   = new Entity();

Alice.sendMsg(Bob);
console.log("Bob's pair 0 : " + Bob.pairs[0].pre_puzzle_key + " -> " + Bob.pairs[0].puzzle);
console.log("Bob's pair 1 : " + Bob.pairs[1].pre_puzzle_key + " -> " + Bob.pairs[1].puzzle);
console.log("Bob's pair 2 : " + Bob.pairs[2].pre_puzzle_key + " -> " + Bob.pairs[2].puzzle);
console.log("Bob's pair 3 : " + Bob.pairs[3].pre_puzzle_key + " -> " + Bob.pairs[3].puzzle);
console.log("Bob's pair 4 : " + Bob.pairs[4].pre_puzzle_key + " -> " + Bob.pairs[4].puzzle);
console.log("Bob's n : " + Bob.n);
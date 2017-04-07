var aesjs = require('aes-js');
var _     = require('underscore');
var jsSHA = require('jssha');
var now   = require("performance-now")

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
@param: secretKey, la clé secrète à encrypter
@param: index, l'index à encrypter
@param: puzzle_key, la clé de 128bits utilisée pour l'encription
*/
function genPuzzle(secretKey, index, puzzle_key){
    var message = secretKey.concat(index);
    var messageBytes = aesjs.utils.utf8.toBytes(message);

    // The counter is optional, and if omitted will begin at 1
    var aesCtr = new aesjs.ModeOfOperation.ctr(puzzle_key, new aesjs.Counter(5));

    var encryptedBytes = aesCtr.encrypt(messageBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
}

/*
Cette fonction decrypte un puzzle cryptographique. Pour ce faire le chiffrement symétrique AES est utilisé.
Le mode d'opération choisi parmi ceux proposés est le CTR.
@param: message, le message à decrypter
@param: puzzle_key, la clé de 128bits utilisée pour l'encription
*/
function decPuzzle(message, puzzle_key){
    // When ready to decrypt the hex string, convert it back to bytes
    var encryptedBytes = aesjs.utils.hex.toBytes(message);

    // The counter mode of operation maintains internal state, so to decrypt a new instance must be instantiated.
    var aesCtr = new aesjs.ModeOfOperation.ctr(puzzle_key, new aesjs.Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Convert our bytes back into text
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

/*
Cette fonction retourne aléatoirement un chiffre entre 0 et N
@param: N, le nombre maximum des chiffres pouvant être générer
*/
function randPairToDecrypt(N){
    //return Math.floor((Math.random() * (N-1)) + 0);
    return _.random(0, N-1);
}


// ----------------------------------- Class: Entité -----------------------------------
/*
Entity: les entités Alice & Bob du protocole.
*/
function Entity(message, size) {
    this.pairs = message;
    this.n = size;
    this.secret_key = "";
    this.index = -1;
    this.sendMsg = function(Entity) { Entity.pairs = message; Entity.n = size;};
    this.receiveMsg = function(secretKey, i) { this.secret_key = secretKey; this.index = i;};
}

// ----------------------------------- MAIN -----------------------------------

console.log("INF8750 - Devoir 2, Exercice 3");
console.log("Simulation du temps de calcul nécessaire à Alice et Bob pour réaliser le protocole dans sa version originale.\n");

console.log("Execution du protocole pour N = " + N + "\n");

var startTime = now();

// Etape 1: génération des n paires (pre_puzzle_key, secret_key, index)
console.log("Etape 1: génération des n paires (pre_puzzle_key, secret_key, index) en cours...");
var nPairs  = genPairs(N);

// Etape 2: génération des n puzzles cryptographiques
console.log("Etape 2: génération des n puzzles cryptographiques en cours...");
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
console.log("Etape 3: envoi du message à Bob en cours...");
var pairsToSend = [];
for(var i = 0; i < N; i++){
    var pre_puzzle_key = nPairs[i].pre_puzzle_key;
    var puzzle         = puzzles[i];

    pairsToSend.push({pre_puzzle_key: pre_puzzle_key, puzzle: puzzle});

    console.log("i = " + i + " pre_puzzle_key: " + pre_puzzle_key + "-> puzzle: " + puzzle + "\tsize: " + puzzle.length);
}

var Alice = new Entity(_.shuffle(pairsToSend), N);      // _.shuffle(list): pour permutter les éléments de la liste
var Bob   = new Entity();

Alice.sendMsg(Bob);
for(var i = 0; i < N; i++){
    console.log("Bob's pair " + i + " : " + Bob.pairs[i].pre_puzzle_key + " -> " + Bob.pairs[i].puzzle);
}
console.log("Bob's n : " + Bob.n);

// Etape 4: decryptage d'une paire aléatoirement choisie.
console.log("Etape 4: decryptage d'une paire aléatoirement choisie en cours...");
var randIndex = randPairToDecrypt(N);
var randPuzzleKey = genPuzzleKey(Bob.pairs[randIndex].pre_puzzle_key);
var messageDec = decPuzzle(Bob.pairs[randIndex].puzzle, randPuzzleKey)
Bob.secret_key = messageDec.substring(0, NB_BYTES);
Bob.index = messageDec[NB_BYTES];

console.log("Bob's dec = pre_puzzle_key: " + Bob.pairs[randIndex].pre_puzzle_key + " randPuzzleKey: " + randPuzzleKey);
console.log("Bob's dec = message: " + messageDec);
console.log("Bob's dec = secretKeyDec " + Bob.secret_key + " indexDec: " + Bob.index);

// Etape 5: envoi de l'index déchiffré par Bob
console.log("Etape 5: envoi de l'index déchiffré par Bob en cours...");
Alice.receiveMsg(Bob.secret_key, Bob.index);

var endTime = now();

console.log("Alice's rec = secretKeyDec " + Alice.secret_key + " indexDec: " + Alice.index);

console.log("Execution du protocole terminé!!");

console.log("\nLe temps d'execution est de: " + (endTime - startTime).toFixed(3) + " milliseconds.");

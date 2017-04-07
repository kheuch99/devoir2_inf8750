var aesjs = require('aes-js');
var _ = require('underscore');
var sha256 = require('sha256');

// 128-bit key (16 bytes * 8 bits/byte = 128 bits)
const SIZE_OF_RANDOM_STR = 16;

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
    var pre_puzzle_key = randomString(SIZE_OF_RANDOM_STR);
    var secret_key = randomString(SIZE_OF_RANDOM_STR);

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
@param: nbTimesToHash, le nombre de fois que la fonction SHA-1 doit être appliqué
@param: pre_puzzle_key, la chaine de caractère à hacher récursivement
@return: puzzle_key = SHA-1 ^ 1000(pre_puzzle_key)
*/
function hashPrePuzzleKey(nbTimesToHash, pre_puzzle_key){

    if(nbTimesToHash == 0){
        return arguments[1];
    }else{
        return hashPrePuzzleKey(--nbTimesToHash, sha256(pre_puzzle_key));
    }
}

/*
Cette fonction génère le "puzzle_key"
@param: nbTimesToHash, le nombre de fois que la fonction de hachage doit être appliqué
@param: pre_puzzle_key, la chaine de caractère à hacher récursivement
*/
function genPuzzleKey(nbTimesToHash, pre_puzzle_key){
    var hashedPrePuzzleKey = hashPrePuzzleKey(nbTimesToHash, pre_puzzle_key);

    return hashedPrePuzzleKey.substring(0, SIZE_OF_RANDOM_STR*2);
}



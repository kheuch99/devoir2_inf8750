var aesjs = require('aes-js');
var _ = require('underscore');

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;

}

/*
Alice génère aléatoirement un ensemble de n paires
(pre_puzzle_key(i),secret_key(i)) où i est l'index de cette paire (pour i entre 1 et n)
et pre_puzzle_key(i) et secret_key(i) sont des chaînes aléatoires de 128 bits.
*/



function operation_one(Index){
    var pre_puzzle_key = randomString(16);
    var secret_key = randomString(16);
    return {
            pre_puzzle_key : pre_puzzle_key,
            secret_key : secret_key,
            index : Index
    }
}

function generation_n_paire(N){
    var table = new Array();
    for(i = 0; i < N ; i++){
        table.push(operation_one(i));
    }
    return table;
}

console.log(generation_n_paire(5))


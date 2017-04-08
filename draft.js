// --------------------------- Version Original avec debbuging message ---------------------------
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

    /*console.log("pre_puzzle_key: " + pre_puzzle_key + " secret_key: " + secret_key + " index: " + index);
    console.log("puzzle_key: " + puzzle_key + "\tsize: " + puzzle_key.length);
    console.log("puzzle " + i + " : " + puzzle + "\tsize: " + puzzle.length);*/
}

// Etape 3: envoi du message à Bob
console.log("Etape 3: envoi du message à Bob en cours...");
var pairsToSend = [];
for(var i = 0; i < N; i++){
    var pre_puzzle_key = nPairs[i].pre_puzzle_key;
    var puzzle         = puzzles[i];

    pairsToSend.push({pre_puzzle_key: pre_puzzle_key, puzzle: puzzle});

    //console.log("i = " + i + " pre_puzzle_key: " + pre_puzzle_key + "-> puzzle: " + puzzle + "\tsize: " + puzzle.length);
}

var Alice = new Entity(_.shuffle(pairsToSend), N);      // _.shuffle(list): pour permutter les éléments de la liste
var Bob   = new Entity();

Alice.sendMsg(Bob);

/*for(var i = 0; i < N; i++){
    console.log("Bob's pair " + i + " : " + Bob.pairs[i].pre_puzzle_key + " -> " + Bob.pairs[i].puzzle);
}
console.log("Bob's n : " + Bob.n);*/

// Etape 4: decryptage d'une paire aléatoirement choisie.
console.log("Etape 4: decryptage d'une paire aléatoirement choisie en cours...");
var randIndex = randPairToDecrypt(N);
var randPuzzleKey = genPuzzleKey(Bob.pairs[randIndex].pre_puzzle_key);
var messageDec = decPuzzle(Bob.pairs[randIndex].puzzle, randPuzzleKey)
Bob.secret_key = messageDec.substring(0, NB_BYTES);
Bob.index = messageDec[NB_BYTES];

/*console.log("Bob's dec = pre_puzzle_key: " + Bob.pairs[randIndex].pre_puzzle_key + " randPuzzleKey: " + randPuzzleKey);
console.log("Bob's dec = message: " + messageDec);
console.log("Bob's dec = secretKeyDec " + Bob.secret_key + " indexDec: " + Bob.index);*/

// Etape 5: envoi de l'index déchiffré par Bob
console.log("Etape 5: envoi de l'index déchiffré par Bob en cours...");
Alice.receiveMsg(Bob.secret_key, Bob.index);

var endTime = now();

//console.log("Alice's rec = secretKeyDec " + Alice.secret_key + " indexDec: " + Alice.index);

console.log("Execution du protocole terminé!!");

console.log("\nLe temps d'execution est de: " + (endTime - startTime).toFixed(3) + " milliseconds.");



// --------------------------- Version Modifiée avec debbuging message ---------------------------

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
var prePuzzleKeyList = [];
for(var i = 0; i < N; i++){
    prePuzzleKeyList.push(nPairs[i].pre_puzzle_key);

    console.log("i = " + i + " pre_puzzle_key: " + prePuzzleKeyList[i] + " -> puzzle: " + puzzles[i] + "\tsize: " + puzzles[i].length);
}

var Alice = new Entity(_.shuffle(prePuzzleKeyList), _.shuffle(puzzles), N);      // _.shuffle(list): pour permutter les éléments de la liste
var Bob   = new Entity();

Alice.sendMsg(Bob);
for(var i = 0; i < N; i++){
    console.log("Bob's list " + i + " : " + Bob.prePuzzleKeyList[i] + " -> " + Bob.puzzleList[i]);
}
console.log("Bob's n : " + Bob.n);

// Etape 4: decryptage d'une paire aléatoirement choisie.
console.log("Etape 4: decryptage d'une paire aléatoirement choisie en cours...");

var puzzleKeyList = [];
for(var i = 0; i < N; i++){
    var pre_puzzle_key = Bob.prePuzzleKeyList[i];
    var puzzle_key     = genPuzzleKey(pre_puzzle_key);
    puzzleKeyList.push(puzzle_key);

    console.log("puzzle_key " + i + " : " + puzzleKeyList[i] + "\tsize: " + puzzleKeyList[i].length);
}

var randPuzzle = randPairToDecrypt(N);
var messageDec;
var j = 0;

console.log("Bob's randPuzzle = " + Bob.puzzleList[randPuzzle]);

do{
    messageDec = decPuzzle(Bob.puzzleList[randPuzzle], puzzleKeyList[j])
    j++;
}while(!isAlphaNum(messageDec) && j < Bob.n);

//var messageDec = decPuzzle(Bob.pairs[randIndex].puzzle, randPuzzleKey)
Bob.secret_key = messageDec.substring(0, NB_BYTES);
Bob.index = messageDec[NB_BYTES];

//console.log("Bob's dec = pre_puzzle_key: " + Bob.pairs[randIndex].pre_puzzle_key + " randPuzzleKey: " + randPuzzleKey);
console.log("Bob's dec = message: " + messageDec);
console.log("Bob's dec = secretKeyDec " + Bob.secret_key + " indexDec: " + Bob.index);

// Etape 5: envoi de l'index déchiffré par Bob
console.log("Etape 5: envoi de l'index déchiffré par Bob en cours...");
Alice.receiveMsg(Bob.secret_key, Bob.index);

var endTime = now();

console.log("Alice's rec = secretKeyDec " + Alice.secret_key + " indexDec: " + Alice.index);

console.log("Execution du protocole terminé!!");

console.log("\nLe temps d'execution est de: " + (endTime - startTime).toFixed(3) + " milliseconds.");
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Dictionary {

    constructor() {
    }

    mapping (string => string) private wordMeanings;
    string[] private words;
    

    function saveMeaning(string memory newWord, string memory wordMeaning) public {
        if (!isWordExists(newWord))
            words.push(newWord);

        wordMeanings[newWord] = wordMeaning;
    }

    function findMeaning(string memory word) view public returns (string memory) {
        return wordMeanings[word];
    }

    function isWordExists(string memory word) view public returns (bool) {
        if (bytes(wordMeanings[word]).length > 0)
            return true;
        
        return false;
    }

    function getAllWords() view public returns (string[] memory) {
        return words;
    }

    function getWordCount() view public returns (uint) {
        return words.length;
    }
}
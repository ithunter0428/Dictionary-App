const DictionaryContract = artifacts.require("Dictionary");

module.exports = function(deployer) {
    deployer.deploy(DictionaryContract);
}
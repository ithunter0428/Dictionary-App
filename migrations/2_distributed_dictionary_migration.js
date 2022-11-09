const DistributedDictionaryContract = artifacts.require("DistributedDictionary");

module.exports = function(deployer) {
    deployer.deploy(DistributedDictionaryContract);
}
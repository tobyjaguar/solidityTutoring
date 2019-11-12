const Splitter = artifacts.require('Splitter');

module.exports = function(deployer) {
  deployer.deploy(Splitter, {gas: 8000000, gasPrice: 1100000000, overwrite: false});
};


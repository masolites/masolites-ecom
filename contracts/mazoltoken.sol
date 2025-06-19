// BEP-20 MAZOL (MZLx) Token with mining and rewards
pragma solidity ^0.8.0;

contract MazolToken is IBEP20 {
    mapping(address => uint256) private _balances;
    uint256 private _totalSupply = 50_000_000 * 10**18;
    string public name = "MAZOL";
    string public symbol = "MZLx";
    uint8 public decimals = 18;
    
    // Mining rewards logic
    function mintMiningReward(address miner, uint256 amount) external onlyPlatform {
        _mint(miner, amount);
    }
    
    // Token burning mechanism
    function burnTransactionFee(uint256 amount) internal {
        _burn(msg.sender, amount);
    }
}

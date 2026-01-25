// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Simple mock ERC20 token with Mintable and Pausable features for testing
contract MockERC20 is ERC20, ERC20Pausable, Ownable {
    constructor(string memory name, string memory symbol, uint8 decimals) ERC20(name, symbol) Ownable(msg.sender) {
        // Constructor initialize token with name, symbol and sets the caller as owner
    }

    // Public mint function restricted to the owner
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Override required internal function for Pausable
    // It ensures token transfers respect the paused state
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }

    // Functions to pause/unpause - restricted to owner via Ownable
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
} 
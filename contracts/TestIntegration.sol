//SPDX-License-Identifier: Unlicense
pragma solidity 0.7.5;

import "./interfaces/IERC20PermitAdapter.sol";

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract TestIntegration {
    IERC20 tokenToBeTransfered;
    IERC20PermitAdapter adapter;

    constructor(IERC20 _tokenToBeTransfered, IERC20PermitAdapter _adapter) {
        tokenToBeTransfered = _tokenToBeTransfered;
        adapter = _adapter;
    }

    function testAdapterTransfer(
        address recipient,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external {
        adapter.transferFrom(
            address(tokenToBeTransfered),
            msg.sender,
            recipient,
            amount,
            deadline,
            signature
        );
    }

    function testLegacyTransfer(address recipient, uint256 amount) external {
        tokenToBeTransfered.transferFrom(msg.sender, recipient, amount);
    }
}

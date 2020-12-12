pragma solidity 0.7.5;

interface IERC20PermitAdapter {
    function transferFrom(
        address asset,
        address from,
        address to,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external;

    function nonceOf(address account) external view returns (uint256);
}

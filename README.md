As I love the concept of non approving contracts to spend your tokens, I'm a big fan of the [ERC20:permit proposal also known as EIP2612](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2237/files/f410734f41f632b42ab4fc4e8695f47d800de709), I decided to create a wrapper contract that allows other contracts to interact with users without the need of approval.

# How it works

The default assumption is that an infinite allowance is given to Adapter contract.
The adapter contract exposes a method transfer from which requires a valid signature, if the signature is valid the erc20 transfer goes further.

# Goal

Save millions in gas.

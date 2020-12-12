As I love the concept of non approving contracts to spend your tokens, I'm a big fan of the [ERC20:permit proposal also known as EIP2612](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2237/files/f410734f41f632b42ab4fc4e8695f47d800de709), I decided to create a wrapper contract that allows other contracts to interact with users without the need of approval.

# How it works

The default assumption is that an infinite allowance is given to Adapter contract.
The adapter contract exposes a transferFrom method which requires a valid signature, if the signature is valid the erc20 transfer goes further.

# Goal

Save millions in gas.

# Gas usage benchmark

![alt text](https://github.com/marcellobardus/erc20-permit-adapter/blob/master/.github/benchmark.png?raw=true)

Asumming that a contract interaction requires an approval(45579 gas) + transferFrom (62496 gas) it gives a sum of 108075 and is executed within 2 transactions which makes the UX worse.

In the case of a proxied transfer it will be more expensive for the first interaction beacause the proxy must be approved. Assuming that an average DeFi user interacts with at least 3 contracts a proxied transfer allows to safe gas due the need of just one approval, btw it improves the UX because the contract interaction can be done in just one transaction :).

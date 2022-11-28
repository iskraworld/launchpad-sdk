# Launchpad SDK
ISKRA launchpad is a verifiable IGO platform.
When the Explorer sale funding exceeds, ISKRA Launchpad runs a lottery process to determine winners
who get a chance to purchase the token.
Even though currently the lottery result can only be submitted by the
launchpad oracle, anyone can run the lottery process by themselves and verify that the result is fair and correct.

## Usage
### Collect tickets by using `eth_getLogs`
To collect tickets, we need to aggregate all participation records.
`fromBlock` should be less than or equal to the block number of the first participation, and `endBlock` should be greater
than or equal to the block number of the last participation record, otherwise it would result in the incomplete collection of tickets.
You can check whether the retrieved tickets are valid by checking explorerSaleInputChecksum.
```
const tickets = await getTickets(igoAddress, provider, fromBlock, numBlocksToQuery);

const { explorerSaleInputChecksum } = await getLotteryInfo(igoAddress, provider);
expect(explorerSaleInputChecksum).to.eq(tickets.inputChecksum);
```
* `igoAddress`: Address of an IGO contract. Each IGO has its own contract.
* `provider`: Provider instance to connect to the chain.
* `fromBlock`: Block number to start collecting participation records.
* `toBlock`: Last block number to collecting participation records.
* `numBlocksToQuery`(Optional): Number of blocks to be fetched at once.

### Do Lottery
After fetching lottery tickets, run a deterministic lottery process.
`seed` is a magic number to make the result unpredictable, which should be the hash of the earliest block with timestamp > sale finishing time.

```
const merkleTree = doLottery(igoId, tickets, totalTickets, seed);

const merkleRoot = merkleTree.getRoot();
const leaf = merkleTree.getLeaf(address);
const proof = merkleTree.getProofByAddress(address);
```

### Submit Lottery Result
The Root of the Merkle tree(lottery result) from the previous section would be submitted by the IGO oracle.
By Merkle proof verification, participants can claim the lottery result.  
Anyone can validate the correctness of the submitted Merkle root by using this SDK.

```
const { explorerSaleResultMerkleRoot, seed } = await getLotteryInfo(igoAddress, provider);
expect(explorerSaleResultMerkleRoot).to.eq(merkleTree.getRoot());
```

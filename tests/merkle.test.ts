import { keccak256 } from 'ethers/lib/utils';
import { expect } from 'chai';
import { LotteryResult, LotteryResultMerkleTree } from '../src';
import { getRandomInt } from './helper';
import { ethers } from 'ethers';

describe("LotteryResultMerkleTree test", () => {
  let tree: LotteryResultMerkleTree;
  let data: LotteryResult[] = [];
  const checksum = keccak256("0x00");
  const numWinners = 50;
  const igoAddress = ethers.Wallet.createRandom().address;

  before("setup", () => {
    for (let i = 0; i < 100; ++i) {
      data.push(randomLotteryResult());
    }
    tree = new LotteryResultMerkleTree(igoAddress, checksum, data, numWinners);
  })

  it("getProof test", () => {
    const targetAddress = data[0].address;
    const proof = tree.getProofByAddress(targetAddress);
    expect(tree.verify(targetAddress, proof)).to.true;
  })

  it("getProof for checksum test", () => {
    const address = '0x0000000000000000000000000000000000000000';
    const leaf: LotteryResult = {
      address,
      win: numWinners,
      lose: 0
    };
    const proof = tree.getProofByLeafValue(leaf);

    expect(tree.verify(address, proof)).to.true;
  })

  it("getProof test", () => {
    const targetAddress = data[0].address;
    const proof = tree.getProofByAddress(targetAddress);
    expect(tree.verify(targetAddress, proof)).to.true;
  })

  it("getLeafs test", () => {
    const leafs = tree.getLeafs();
    expect(leafs.length).eq(100);
  })
})

function randomLotteryResult(): LotteryResult {
  return {
    address: ethers.Wallet.createRandom().address,
    win: getRandomInt(0, 10),
    lose: getRandomInt(0, 10)
  }
}


import { LotteryTicket, doLottery, LotteryTickets } from '../src';
import { keccak256, randomBytes } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { getRandomInt } from './helper';
import { expect } from 'chai';

describe("Lottery test", () => {
  const participation: Map<string, number> = new Map<string, number>();
  const checksum = keccak256("0x00");
  const numCandidates = 50;
  const numWinTickets = 100;
  const igoAddress = ethers.Wallet.createRandom().address;

  it("check lottery result", () => {
    let totalTickets = 0;
    const tickets: LotteryTicket[] = [];

    for (let i = 0; i < numCandidates; ++i) {
      const addr = ethers.Wallet.createRandom().address;
      const numTickets = getRandomInt(numWinTickets, numWinTickets * 2);
      for (let j = 0; j < numTickets; ++j) { // each participant buys 100 tickets
        tickets.push({ account: addr });
      }
      participation.set(addr, numTickets);
      totalTickets += numTickets;
    }

    const lotteryTickets: LotteryTickets = {
      tickets,
      inputChecksum: checksum
    }
    const seed = '0x' + Buffer.from(randomBytes(32)).toString('hex');
    const result = doLottery(igoAddress, lotteryTickets, numWinTickets, seed);

    let winTickets = 0;
    let loseTickets = 0;
    for (const addr of participation.keys()) {
      const leaf = result.getLeaf(addr);
      winTickets += leaf.win;
      loseTickets += leaf.lose;
      expect(leaf.win + leaf.lose).to.eq(participation.get(addr));
    }
    expect(winTickets).to.eq(numWinTickets);
    expect(loseTickets).to.eq(totalTickets - winTickets);
  })
})

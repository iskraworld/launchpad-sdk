import { BigNumber, Contract } from 'ethers';
import { FunctionFragment, Interface, solidityKeccak256 } from 'ethers/lib/utils';
import { LotteryResultMerkleTree } from './merkle';
import { Provider } from '@ethersproject/abstract-provider';

export interface LotteryTickets {
  readonly inputChecksum: string;
  readonly tickets: LotteryTicket[];
}

export interface LotteryTicket {
  readonly account: string;
}

export interface LotteryResult {
  readonly address: string;
  readonly win: number;
  readonly lose: number;
}

export interface LotteryInfo {
  readonly explorerSaleInputChecksum: string;
  readonly explorerSaleResultMerkleRoot: string;
  readonly seed: string;
}

const GET_LOTTERY_RESULT_FUNCTION_FRAGMENT = FunctionFragment.fromObject({
  inputs: [],
  name: "getLotteryResult",
  outputs: [
    {
      internalType: "bytes32",
      name: "explorerSaleInputChecksum",
      type: "bytes32"
    },
    {
      internalType: "bytes32",
      name: "explorerSaleResultMerkleRoot",
      type: "bytes32"
    },
    {
      internalType: "bytes32",
      name: "seed",
      type: "bytes32"
    }
  ],
  stateMutability: "view",
  type: "function"
})

export function getLotteryInfo(
  igoAddress: string,
  provider: Provider
): Promise<LotteryInfo> {
  const iface = new Interface([GET_LOTTERY_RESULT_FUNCTION_FRAGMENT]);
  const igo = new Contract(igoAddress, iface, provider);
  return igo.getLotteryResult();
}

export function doLottery(
  igoAddress: string,
  lotteryTickets: LotteryTickets,
  numWinners: number,
  seed: string
): LotteryResultMerkleTree {
  const tickets = lotteryTickets.tickets;

  const participants = [...new Set(tickets.map((t: LotteryTicket) => t.account))];
  const loseTickets = new Map<string, number>();

  while (numWinners < tickets.length) {
    const rand = BigNumber.from(
      solidityKeccak256(
        ['address', 'uint32', 'bytes32', 'bytes32'],
        [igoAddress, tickets.length, lotteryTickets.inputChecksum, seed]),
    );

    // rand % tickets.length
    const idx = rand.sub(rand.div(tickets.length).mul(tickets.length)).toNumber();
    const loser = tickets[idx].account;
    tickets[idx] = tickets[tickets.length - 1];
    tickets.pop();

    loseTickets.set(loser, (loseTickets.get(loser) || 0) + 1);
  }

  const winTickets = new Map<string, number>();
  tickets.forEach((ticket) => {
    winTickets.set(ticket.account, (winTickets.get(ticket.account) || 0) + 1);
  });

  const data: LotteryResult[] = participants.map((address: string) => {
    const win = winTickets.get(address) || 0;
    const lose = loseTickets.get(address) || 0;
    return { address, win, lose };
  });

  return new LotteryResultMerkleTree(igoAddress, lotteryTickets.inputChecksum, data, numWinners);
}

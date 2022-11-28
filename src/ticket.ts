import { defaultAbiCoder, EventFragment, Interface, solidityKeccak256 } from 'ethers/lib/utils';
import { LotteryTicket, LotteryTickets } from './igo';
import { Provider } from '@ethersproject/abstract-provider';

const DEFAULT_NUM_BLOCKS_TO_QUERY = 1000;
const EVENT_FRAGMENT = EventFragment.fromObject({
  anonymous: false,
  inputs: [
    {
      indexed: true,
      internalType: "enum IInitialGameOffering.SaleKind",
      name: "saleKind",
      type: "uint8"
    },
    {
      indexed: true,
      internalType: "address",
      name: "account",
      type: "address"
    },
    {
      indexed: false,
      internalType: "address",
      name: "paymentToken",
      type: "address"
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "numTickets",
      type: "uint256"
    }
  ],
  name: "SaleParticipation",
  type: "event"
});

interface Log {
  readonly data: string;
  readonly topics: string[];
  readonly blockNumber: number;
}

export async function getTickets(
  igoAddress: string,
  provider: Provider,
  fromBlock: number,
  endBlock: number,
  numBlocksToQuery: number = DEFAULT_NUM_BLOCKS_TO_QUERY,
): Promise<LotteryTickets> {
  if (numBlocksToQuery === 0) {
    throw Error("numBlocksToQuery should be larger than 0.");
  }

  const until = Math.min(endBlock, (await provider.getBlock("latest")).number);

  let start = fromBlock;
  let inputChecksum = "0x0000000000000000000000000000000000000000000000000000000000000000";
  let tickets: LotteryTicket[] = [];
  const iface = new Interface([EVENT_FRAGMENT]);
  const topic = iface.getEventTopic(EVENT_FRAGMENT)

  while (start <= until) {
    let end = start + numBlocksToQuery - 1;
    if (end > until) end = until
    console.info(`Polling event for '${igoAddress}': from block ${start} to block ${end}.`);

    const logs = await provider.getLogs({
      fromBlock: start,
      toBlock: end,
      address: igoAddress,
      topics: [
        topic,
        defaultAbiCoder.encode(["uint8"], [1]),
      ],
    });

    const result = getTicketsFromLogs(iface, inputChecksum, logs);
    inputChecksum = result.inputChecksum;

    // maximum allowed array length in javascript = maximum number of tickets = 2**32 - 1
    tickets = tickets.concat(result.tickets);
    start = end + 1;
  }
  return { inputChecksum, tickets };
}

function getTicketsFromLogs(iface: Interface, prevInputChecksum: string, logs: Log[]): LotteryTickets {
  let inputChecksum = prevInputChecksum;
  const tickets: LotteryTicket[] = [];
  logs.forEach((log) => {
    const { account, numTickets } = iface.decodeEventLog(EVENT_FRAGMENT, log.data, log.topics);
    for (let i = 0; i < numTickets; ++i) {
      tickets.push({ account });
    }
    inputChecksum = solidityKeccak256(
      ["bytes32", "address", "uint32", "uint256"],
      [inputChecksum, account, numTickets, log.blockNumber]
    );
  });

  return { inputChecksum, tickets };
}

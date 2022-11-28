import { LotteryTickets } from './igo';
import { Provider } from '@ethersproject/abstract-provider';
export declare function getTickets(igoAddress: string, provider: Provider, fromBlock: number, endBlock: number, numBlocksToQuery?: number): Promise<LotteryTickets>;

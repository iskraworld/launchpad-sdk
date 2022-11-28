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
export declare function getLotteryInfo(igoAddress: string, provider: Provider): Promise<LotteryInfo>;
export declare function doLottery(igoAddress: string, lotteryTickets: LotteryTickets, numWinners: number, seed: string): LotteryResultMerkleTree;

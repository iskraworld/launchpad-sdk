import { LotteryResult } from './igo';
export interface Leaf {
    readonly data: LotteryResult;
    readonly address: string;
    readonly win: number;
    readonly lose: number;
}
export declare class LotteryResultMerkleTree {
    private readonly address;
    private readonly inputChecksum;
    private readonly merkleTree;
    private readonly resultMap;
    constructor(address: string, inputChecksum: string, data: LotteryResult[], numWinTickets: number);
    getRoot(): string;
    getProofByAddress(address: string): string[];
    getProofByLeafValue(value: LotteryResult): string[];
    getChecksumProof(): string[];
    verify(address: string, proof: string[]): boolean;
    getLeaf(address: string): Leaf;
    leafValue(d: LotteryResult): any[];
}

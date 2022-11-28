import { LotteryResult } from './igo';
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export interface Leaf {
  readonly data: LotteryResult;
  readonly address: string;
  readonly win: number;
  readonly lose: number;
}

export class LotteryResultMerkleTree {
  private readonly merkleTree: StandardMerkleTree<any>;
  private readonly resultMap: Map<string, LotteryResult> = new Map<string, LotteryResult>();

  constructor(
    private readonly address: string,
    private readonly inputChecksum: string,
    data: LotteryResult[],
    numWinTickets: number,
  ) {
    // dummy data to ensure data integrity
    data.push({
      address: ADDRESS_ZERO,
      win: numWinTickets,
      lose: 0,
    });
    const leaves = data.map((d) => {
      this.resultMap.set(d.address, d);
      return [this.address, d.address, d.win, d.lose, this.inputChecksum];
    });
    this.merkleTree = StandardMerkleTree.of(leaves, ['address', 'address', 'uint32', 'uint32', 'bytes32']);
  }

  getRoot(): string {
    return this.merkleTree.root;
  }

  getProofByAddress(address: string): string[] {
    const leaf = this.getLeaf(address);
    return this.getProofByLeafValue(leaf.data);
  }

  getProofByLeafValue(value: LotteryResult): string[] {
    const leaf = this.leafValue(value);
    return this.merkleTree.getProof(leaf);
  }

  getChecksumProof(): string[] {
    return this.getProofByAddress(ADDRESS_ZERO);
  }

  verify(address: string, proof: string[]): boolean {
    const leaf = this.getLeaf(address);
    return this.merkleTree.verify(this.leafValue(leaf.data), proof);
  }

  getLeaf(address: string): Leaf {
    if (this.resultMap.has(address)) {
      const result = this.resultMap.get(address)!;
      return {
        data: result,
        address,
        win: result.win,
        lose: result.lose,
      };
    } else {
      throw Error(`unknown address: ${address}`);
    }
  }

  getLeafs(): Leaf[] {
    const leafs: Leaf[] = [];
    this.resultMap.forEach(value => {
      if (value.address !== ADDRESS_ZERO)
        leafs.push({
          data: value,
          address: value.address,
          win: value.win,
          lose: value.lose,
        })
    })
    return leafs;
  }

  leafValue(d: LotteryResult): any[] {
    return [this.address, d.address, d.win, d.lose, this.inputChecksum];
  }
}

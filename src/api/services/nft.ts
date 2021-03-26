import { request } from "graphql-request";
import {
  INFT,
  NFTListPaginatedResponse,
  NFTListResponse,
  PaginationResponse,
} from "src/interfaces/graphQL";
import { populateNFT } from "../helpers/nftHelpers";
import QueriesBuilder from "./gqlQueriesBuilder";

export class NFTService {
  /**
   * Requests all NFTs from the blockchain
   * @throws Will throw an error if can't request indexer
   */
  async getAllNFTs(): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.allNFTs();
      const result: NFTListResponse = await request(
        "https://indexer.chaos.ternoa.com/",
        query
      );

      const NFTs = result.nftEntities.nodes;
      return Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)));
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Returns a limited amount of all NFTs
   * @param page - Page number
   * @param limit - Number of elements per page
   * @throws Will throw an error if can't request indexer
   * @returns - A paginated array of nfts
   */
  async getPaginatedNFTs(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.allNFTsPaginated(limit, (page - 1) * limit);
      const result: NFTListPaginatedResponse = await request(
        "https://indexer.chaos.ternoa.com/",
        query
      );

      const ret: PaginationResponse<INFT[]> = {
        data: await Promise.all(
          result.nftEntities.nodes.map(async (NFT) => populateNFT(NFT))
        ),
        hasNextPage: result.nftEntities.pageInfo.hasNextPage,
        hasPreviousPage: result.nftEntities.pageInfo.hasPreviousPage,
        totalCount: result.nftEntities.totalCount,
      };
      return ret;
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Requests a single NFT from the blockchain
   * @param id - the NFT's id
   * @throws Will throw an error if the NFT can't be found
   */
  async getNFT(id: string): Promise<INFT> {
    try {
      const query = QueriesBuilder.NFTfromId(id);
      const result: NFTListResponse = await request(
        "https://indexer.chaos.ternoa.com/",
        query
      );
      let NFT = result.nftEntities.nodes[0];
      if (!NFT) throw new Error();

      NFT = await populateNFT(NFT);

      return NFT;
    } catch (err) {
      throw new Error("Couldn't get NFT");
    }
  }

  /**
   * Gets all NFTs owned by a user
   * @param ownerId - The user's blockchain id
   * @throws Will throw an error if can't request indexer
   */
  async getNFTsFromOwner(ownerId: string): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.NFTsFromOwnerId(ownerId);
      const result: NFTListResponse = await request(
        "https://indexer.chaos.ternoa.com/",
        query
      );

      const NFTs = result.nftEntities.nodes;
      return Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)));
    } catch (err) {
      throw new Error("Couldn't get user's NFTs");
    }
  }

  /**
   * Returns a limited amount of user's NFTs
   * @param ownerId - The user's blockchain id
   * @param page - Page number
   * @param limit - Number of elements per page
   * @throws Will throw an error if can't request indexer
   * @returns - A paginated array of nfts
   */
  async getPaginatedNFTsFromOwner(
    ownerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.NFTsFromOwnerIdPaginated(
        ownerId,
        limit,
        (page - 1) * limit
      );
      const result: NFTListPaginatedResponse = await request(
        "https://indexer.chaos.ternoa.com/",
        query
      );

      const ret: PaginationResponse<INFT[]> = {
        data: await Promise.all(
          result.nftEntities.nodes.map(async (NFT) => populateNFT(NFT))
        ),
        hasNextPage: result.nftEntities.pageInfo.hasNextPage,
        hasPreviousPage: result.nftEntities.pageInfo.hasPreviousPage,
        totalCount: result.nftEntities.totalCount,
      };
      return ret;
    } catch (err) {
      throw new Error("Couldn't get user's NFTs");
    }
  }
}

export default new NFTService();

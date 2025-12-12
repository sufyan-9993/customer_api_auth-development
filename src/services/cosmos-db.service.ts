import { Injectable, OnModuleInit } from '@nestjs/common';
// import { cosmosConfig } from '../config/database.config';
import {
  Container,
  CosmosClient,
  Database,
  ItemDefinition,
} from '@azure/cosmos';

@Injectable()
export class CosmosDbService implements OnModuleInit {
  private database: Database;
  private client: CosmosClient;
  private containers: Map<string, Container> = new Map();

  async onModuleInit(): Promise<void> {
    // const config = cosmosConfig();
    // const client = new CosmosClient({
    //   endpoint: config.endpoint,
    //   key: config.key,
    //   connectionPolicy: {
    //     enableEndpointDiscovery: true,
    //   },
    // });
    // const { database } = await client.databases.createIfNotExists({
    //   id: config.databaseId,
    // });
    // this.client = client;
    // this.database = database;
  }

  async getContainer(containerId: string): Promise<Container> {
    if (this.containers.has(containerId)) {
      const container = this.containers.get(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }
      return container;
    }

    const { container } = await this.database.containers.createIfNotExists({
      id: containerId,
      partitionKey: {
        paths: ['/id'],
      },
    });
    if (!container) {
      throw new Error(`Failed to create container ${containerId}`);
    }
    this.containers.set(containerId, container);
    return container;
  }

  async query<T>(
    containerId: string,
    query: string,
    parameters: any[] = [],
  ): Promise<T[]> {
    const container = await this.getContainer(containerId);
    const { resources } = await container.items
      .query({ query, parameters })
      .fetchAll();
    return resources as T[];
  }

  async create<T extends ItemDefinition>(
    containerId: string,
    item: T,
  ): Promise<T> {
    const container = await this.getContainer(containerId);
    const { resource } = await container.items.create(item);
    return resource as T;
  }

  async update<T extends ItemDefinition>(
    containerId: string,
    id: string,
    item: T,
  ): Promise<T> {
    const container = await this.getContainer(containerId);
    const { resource } = await container.item(id, id).replace(item);
    if (!resource) {
      throw new Error(`Failed to update item ${id}`);
    }
    return resource as unknown as T;
  }

  async delete(containerId: string, id: string): Promise<void> {
    const container = await this.getContainer(containerId);
    await container.item(id).delete();
  }
}

import { Global, Module } from '@nestjs/common';
import { CosmosDbService } from './cosmos-db.service';

@Global()
@Module({
  providers: [CosmosDbService],
  exports: [CosmosDbService],
})
export class ServicesModule {}

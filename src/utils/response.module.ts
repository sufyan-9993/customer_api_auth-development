import { Global, Module } from '@nestjs/common';
import { ResponseService } from './response.utils';

@Global()
@Module({
  providers: [ResponseService],
  exports: [ResponseService],
})
export class ResponseModule {}

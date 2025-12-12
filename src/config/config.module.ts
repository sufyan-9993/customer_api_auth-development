import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import { JwtConfigService } from './jwt.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
  ],
  providers: [JwtConfigService],
  exports: [JwtConfigService],
})
export class ConfigModule {}

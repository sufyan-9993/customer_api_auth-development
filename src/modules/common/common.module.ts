import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationMaster } from './entities/locationMaster.entity';
import { ResponseService } from '../../utils/response.utils';

@Module({
  imports: [TypeOrmModule.forFeature([LocationMaster])],
  controllers: [CommonController],
  providers: [CommonService, ResponseService],
})
export class CommonModule {}

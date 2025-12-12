import { Injectable, Logger } from '@nestjs/common';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor() {}
  create(createAuditDto: CreateAuditDto) {
    this.logger.log(
      `Creating Audit with data: ${JSON.stringify(createAuditDto)}`,
    );
    return 'This action adds a new audit';
  }

  findAll() {
    return `This action returns all audit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} audit`;
  }

  update(id: number, updateAuditDto: UpdateAuditDto) {
    this.logger.log(
      `Updating Audit #${id} with data: ${JSON.stringify(updateAuditDto)}`,
    );
    return `This action updates a #${id} audit`;
  }

  remove(id: number) {
    return `This action removes a #${id} audit`;
  }
}

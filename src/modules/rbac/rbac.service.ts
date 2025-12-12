import { Injectable, Logger } from '@nestjs/common';
import { CreateRbacDto } from './dto/create-rbac.dto';
import { UpdateRbacDto } from './dto/update-rbac.dto';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);
  constructor() {}
  create(createRbacDto: CreateRbacDto) {
    this.logger.log(
      `Creating RBAC with data: ${JSON.stringify(createRbacDto)}`,
    );
    return 'This action adds a new rbac';
  }

  findAll() {
    return `This action returns all rbac`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rbac`;
  }

  update(id: number, updateRbacDto: UpdateRbacDto) {
    this.logger.log(
      `Updating RBAC #${id} with data: ${JSON.stringify(updateRbacDto)}`,
    );
    return `This action updates a #${id} rbac`;
  }

  remove(id: number) {
    return `This action removes a #${id} rbac`;
  }
}

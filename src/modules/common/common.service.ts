import { Injectable, Logger } from '@nestjs/common';
import { CreateLocationDto, UpdateLocationDto } from './dto/create-common.dto';
import { Repository } from 'typeorm';
import { LocationMaster } from './entities/locationMaster.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationType } from './entities/locationMaster.entity';
import { ApiResponse, ResponseService } from '../../utils/response.utils';
import { HttpException } from '@nestjs/common';
import { HTTP_STATUS } from '../../constants/index';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);
  constructor(
    @InjectRepository(LocationMaster)
    private readonly repo: Repository<LocationMaster>,

    private readonly response: ResponseService,
  ) {}

  async getCountries(): Promise<ApiResponse<LocationMaster[] | null>> {
    try {
      const data = await this.repo.find({
        where: { type: LocationType.COUNTRY, isDeleted: false },
      });
      return this.response.success(data, 'Countries fetched');
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', message);
        throw err;
      }
      this.logger.log('Internal Server Error: ', message);
      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStates(
    countryId: string,
  ): Promise<ApiResponse<LocationMaster[] | null>> {
    try {
      const parent = await this.repo.findOne({ where: { id: countryId } });
      if (!parent) return this.response.error(404, 'Country not found');
      const states = await this.repo.find({
        where: {
          type: LocationType.STATE,
          parent: { id: countryId },
          isDeleted: false,
        },
        relations: ['parent'],
      });

      return this.response.success(states, 'States fetched');
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', message);
        throw err;
      }
      this.logger.log('Internal Server Error: ', message);
      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCities(
    stateId: string,
  ): Promise<ApiResponse<LocationMaster[] | null>> {
    try {
      const parent = await this.repo.findOne({
        where: { id: stateId.toString() },
      });
      if (!parent) return this.response.error(404, 'State not found');
      const cities = await this.repo.find({
        where: {
          type: LocationType.CITY,
          parent: { id: stateId.toString() },
          isDeleted: false,
        },
        relations: ['parent'],
      });

      return this.response.success(cities, 'Cities fetched');
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', message);
        throw err;
      }
      this.logger.log('Internal Server Error: ', message);
      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(
    dto: CreateLocationDto,
  ): Promise<ApiResponse<LocationMaster | null>> {
    try {
      let parent: LocationMaster | null = null;

      if (dto.parentId) {
        parent = await this.repo.findOne({ where: { id: dto.parentId } });
        if (!parent) {
          return this.response.error(404, 'Parent not found');
        }
      }

      const payload: Partial<LocationMaster> = {
        type: dto.type,
        value: dto.value,
        parent,
      };

      const entity = this.repo.create(payload);
      await this.repo.save(entity);

      return this.response.success(entity, 'Location created');
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', message);
        throw err;
      }
      this.logger.log('Internal Server Error: ', message);
      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    dto: UpdateLocationDto,
  ): Promise<ApiResponse<LocationMaster | null>> {
    try {
      const location = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
      if (!location) return this.response.error(404, 'Location not found');

      if (dto.parentId) {
        const parent = await this.repo.findOne({
          where: { id: dto.parentId },
        });
        if (!parent) return this.response.error(404, 'Parent not found');
        location.parent = parent;
      }

      if (dto.value) location.value = dto.value;
      if (dto.type) location.type = dto.type;

      await this.repo.save(location);
      return this.response.success(location, 'Location updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', message);
        throw err;
      }
      this.logger.log('Internal Server Error: ', message);
      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const location = await this.repo.findOne({
        where: { id: id, isDeleted: false },
      });
      if (!location) return this.response.error(404, 'Location not found');

      location.isDeleted = true;
      await this.repo.save(location);

      return this.response.success(null, 'Location deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', message);
        throw err;
      }
      this.logger.log('Internal Server Error: ', message);
      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

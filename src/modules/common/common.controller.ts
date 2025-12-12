import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommonService } from './common.service';
import {
  GetStatesDto,
  GetCitiesDto,
  UpdateLocationDto,
  CreateLocationDto,
} from './dto/create-common.dto';

@ApiTags('Common')
@Controller('common')
export class CommonController {
  private readonly logger = new Logger(CommonController.name);

  constructor(private readonly service: CommonService) {}

  @ApiOperation({ summary: 'Get list of countries' })
  @Get('countries')
  getCountries() {
    this.logger.log('Fetching all countries');
    return this.service.getCountries();
  }

  @ApiOperation({ summary: 'Get states by country ID' })
  @Get('states/:countryId')
  getStates(@Param() dto: GetStatesDto) {
    this.logger.log(`Fetching states for countryId: ${dto.countryId}`);
    return this.service.getStates(dto.countryId);
  }

  @ApiOperation({ summary: 'Get cities by state ID' })
  @Get('cities/:stateId')
  getCities(@Param() dto: GetCitiesDto) {
    this.logger.log(`Fetching cities for stateId: ${dto.stateId}`);
    return this.service.getCities(dto.stateId);
  }

  @ApiOperation({ summary: 'Create a new location (country/state/city)' })
  @Post()
  create(@Body() dto: CreateLocationDto) {
    this.logger.log(`Creating new location: ${JSON.stringify(dto)}`);
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Update an existing location' })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    this.logger.log(`Updating location with ID: ${id}`);
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a location by ID' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`Deleting location with ID: ${id}`);
    return this.service.delete(id);
  }
}

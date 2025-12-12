import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Logger,
  Req,
  Query,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from '../common/dto/page.dto';
import { UserRequestDto } from '../common/dto/user-request.dto';
import { Request } from 'express';

@ApiTags('Organization/Customer-Module')
@Controller('organization')
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);
  constructor(private readonly organizationService: OrganizationService) {}
  @ApiOperation({ summary: 'create Organization' })
  @Post()
  create(
    @Req() req: Request & { user?: UserRequestDto },
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    this.logger.log(
      `Creating Organization with data: ${JSON.stringify(
        createOrganizationDto,
      )}`,
    );
    return this.organizationService.create(
      createOrganizationDto,
      req.user as UserRequestDto,
    );
  }

  @ApiOperation({ summary: 'Get all Organization/Sub-Organization' })
  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Req() req: Request & { user?: UserRequestDto },
  ) {
    return this.organizationService.findAll(
      pageOptionsDto,
      req.user as UserRequestDto,
    );
  }

  @ApiOperation({ summary: 'Get Organization/Sub-Organization by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Req() req: Request & { user?: UserRequestDto },
  ) {
    return this.organizationService.update(
      id,
      updateOrganizationDto,
      req.user as UserRequestDto,
    );
  }

  @ApiOperation({ summary: 'Get Sub-Organizations by Parent ID' })
  @Get(':parentId/sub-organizations')
  async getSubOrganizations(
    @Param('parentId') parentId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.organizationService.getSubOrganizations(
      parentId,
      pageOptionsDto,
    );
  }

  @ApiOperation({ summary: 'Get Users of an Organization' })
  @Get('users')
  async getOrganizationUsers(
    @Query() pageOptionsDto: PageOptionsDto,
    @Req() req: Request & { user?: UserRequestDto },
  ) {
    return this.organizationService.getOrganizationUsers(
      pageOptionsDto,
      req.user as UserRequestDto,
    );
  }

  @ApiOperation({
    summary: 'Get Users of Sub-Organizations by Organization ID',
  })
  @Get(':id/sub-users')
  async getSubOrgUsers(
    @Param('id') id: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.organizationService.getAllSubOrgUsers(id, pageOptionsDto);
  }
}

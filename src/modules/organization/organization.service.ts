import { Injectable, Logger } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { ResponseService } from '../../utils/response.utils';
import { HTTP_STATUS, status } from '../../constants/index';
import { User } from '../users/entities/user.entity';
import { UserRequestDto } from '../common/dto/user-request.dto';
import { PageOptionsDto } from '../common/dto/page.dto';
import { UserNotFoundException } from '../../errors';
// import { QueryParamsOrganizationDto } from './dto/query-params-organization.dto';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly responseService: ResponseService,
    private readonly dataSource: DataSource,
  ) {}
  async create(
    createOrganizationDto: CreateOrganizationDto,
    user: UserRequestDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { user: userData, ...orgData } = createOrganizationDto;

      // Check existing user
      const exists = await this.userRepo.findOne({
        where: { email: userData.email },
      });

      if (exists) {
        return this.responseService.error(
          HTTP_STATUS.CONFLICT,
          'User already exists',
        );
      }

      const newOrg = new Organization();

      // ==============================
      // ROOT ORGANIZATION
      // ==============================
      if (!user.organization) {
        newOrg.level = 0;
        newOrg.parent = null;
        newOrg.root = null;
      }

      // ==============================
      // CHILD ORGANIZATION
      // ==============================
      else {
        const parentOrg = await this.organizationRepo.findOne({
          where: { id: user.organization.id },
          relations: ['root'],
        });

        if (!parentOrg) {
          return this.responseService.error(
            HTTP_STATUS.NOT_FOUND,
            'Parent organization not found',
          );
        }

        newOrg.parent = parentOrg;
        newOrg.level = parentOrg.level + 1;
        newOrg.root = parentOrg.root ?? parentOrg;
      }

      Object.assign(newOrg, {
        ...orgData,
        status: status.INACTIVE, // always inactive on creation
        created_by: user.id.toString(),
        created_at: new Date(),
      });

      const savedOrg = await queryRunner.manager.save(Organization, newOrg);

      // Create admin user for this org
      const adminUser = queryRunner.manager.create(User, {
        ...userData,
        organization: savedOrg,
        created_by: user.id.toString(),
        created_at: new Date(),
        status: status.INACTIVE,
      });

      await queryRunner.manager.save(adminUser);

      await queryRunner.commitTransaction();

      return this.responseService.success(
        savedOrg,
        'Organization created successfully',
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.responseService.error(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        err instanceof Error ? err.message : 'Failed to create organization',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto, user: UserRequestDto) {
    try {
      const qb = this.organizationRepo
        .createQueryBuilder('org')
        .leftJoinAndSelect('org.parent', 'parent')
        .leftJoinAndSelect('org.root', 'root')
        .leftJoinAndSelect('org.children', 'children')
        .leftJoinAndSelect('org.country', 'country')
        .leftJoinAndSelect('org.state', 'state')
        .leftJoinAndSelect('org.city', 'city')
        .orderBy('org.created_at', pageOptionsDto.order)
        .skip(pageOptionsDto.skip)
        .take(pageOptionsDto.take);

      // SUPER ADMIN (no org assigned)
      if (!user.organization) {
        qb.where('org.parent_id IS NULL');
      }

      // ORG ADMIN (show only direct children)
      else {
        qb.where('org.parent_id = :parentId', {
          parentId: user.organization.id,
        });
      }

      const [entities, total] = await qb.getManyAndCount();

      return this.responseService.paginated(
        entities,
        total,
        pageOptionsDto.page,
        pageOptionsDto.take,
        'Organizations fetched successfully',
      );
    } catch (err) {
      this.logger.error(`Error fetching organizations: ${err}`);
      return this.responseService.error(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to fetch organizations',
      );
    }
  }

  async findOne(id: string) {
    try {
      this.logger.log(`Fetching Organization with ID: ${id}`);

      const organization = await this.organizationRepo
        .createQueryBuilder('org')
        .leftJoinAndSelect('org.parent', 'parent')
        .leftJoinAndSelect('org.root', 'root')
        .leftJoinAndSelect('org.children', 'children')
        .leftJoinAndSelect('org.country', 'country')
        .leftJoinAndSelect('org.state', 'state')
        .leftJoinAndSelect('org.city', 'city')
        // .leftJoinAndSelect('org.pools', 'pools')
        // .leftJoinAndSelect('org.plans', 'plans')
        .leftJoinAndSelect('org.users', 'users')
        .where('org.id = :id', { id })
        .getOne();

      if (!organization) {
        this.logger.warn(`Organization ID ${id} not found`);
        return this.responseService.error(
          HTTP_STATUS.NOT_FOUND,
          'Organization not found',
        );
      }

      return this.responseService.success(
        organization,
        'Organization details fetched successfully',
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error fetching Organization #${id}: ${errorMessage}`);
      return this.responseService.error(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to fetch organization',
      );
    }
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    user: UserRequestDto,
  ) {
    try {
      this.logger.log(`Updating organization ${id}`);

      const org = await this.organizationRepo.findOne({
        where: { id },
        relations: ['parent', 'root'],
      });

      if (!org) {
        return this.responseService.error(
          HTTP_STATUS.NOT_FOUND,
          'Organization not found',
        );
      }

      // ==============
      // UPDATE BASIC FIELDS
      // ==============
      Object.assign(org, {
        ...updateOrganizationDto,
        updated_by: user.id,
        updated_at: new Date(),
      });

      const updated = await this.organizationRepo.save(org);

      return this.responseService.success(
        updated,
        'Organization updated successfully',
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error updating organization: ${errorMessage}`,
        errorStack,
      );

      return this.responseService.error(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        errorMessage,
      );
    }
  }

  async getSubOrganizations(parentId: string, pageOptionsDto: PageOptionsDto) {
    try {
      this.logger.log(`Fetching sub-organizations for parent: ${parentId}`);

      // -----------------------------------------------------
      // Load sub-organizations of this parent
      // -----------------------------------------------------
      const qb = this.organizationRepo
        .createQueryBuilder('organization')
        .leftJoinAndSelect('organization.parent', 'parent')
        .leftJoinAndSelect('organization.root', 'root')

        // load direct children
        .leftJoinAndSelect('organization.children', 'children')

        // location relations
        .leftJoinAndSelect('organization.country', 'country')
        .leftJoinAndSelect('organization.state', 'state')
        .leftJoinAndSelect('organization.city', 'city')

        // Correct condition: use parent.id, not parent_id
        .where('parent.id = :parentId', { parentId })

        .orderBy('organization.created_at', pageOptionsDto.order)
        .skip(pageOptionsDto.skip)
        .take(pageOptionsDto.take);

      const [entities, total] = await qb.getManyAndCount();

      return this.responseService.paginated(
        entities,
        total,
        pageOptionsDto.page,
        pageOptionsDto.take,
        'Sub-organizations fetched successfully',
      );
    } catch (error) {
      this.logger.error(
        `Error fetching sub-organizations: ${error instanceof Error ? error.message : error}`,
      );

      return this.responseService.error(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Error fetching sub-organizations',
      );
    }
  }

  async getOrganizationUsers(
    pageOptionsDto: PageOptionsDto,
    user: UserRequestDto,
  ) {
    try {
      const loggedInUser = await this.userRepo.findOne({
        where: { id: user.id },
        relations: ['organization', 'organization.parent', 'organization.root'],
      });

      if (!loggedInUser) {
        throw new UserNotFoundException(`User Not Found`);
      }

      const org = loggedInUser.organization;

      const qb = this.userRepo
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.organization', 'org')
        .leftJoinAndSelect('u.role', 'role')
        .orderBy('u.created_at', pageOptionsDto.order)
        .skip(pageOptionsDto.skip)
        .take(pageOptionsDto.take);

      // SUPER ADMIN (no org)
      if (!org) {
        qb.where('org.parent_id IS NULL');
      }

      // ORG ADMIN (only users of direct child orgs)
      else {
        qb.where('org.parent_id = :parentId', {
          parentId: org.id,
        });
      }

      const [entities, total] = await qb.getManyAndCount();

      return this.responseService.paginated(
        entities,
        total,
        pageOptionsDto.page,
        pageOptionsDto.take,
        'Organization users fetched successfully',
      );
    } catch (err) {
      this.logger.error(`Error fetching users: ${(err as Error).message}`);
      return this.responseService.error(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to fetch users',
      );
    }
  }

  async getAllSubOrgUsers(orgId: string, pageOptionsDto: PageOptionsDto) {
    try {
      // Fetch all organizations under this org (recursive)
      const orgs = await this.organizationRepo
        .createQueryBuilder('org')
        .where('org.rootId = :orgId OR org.parentId = :orgId', { orgId })
        .getMany();

      // Collect all org IDs including parent
      const orgIds = [orgId, ...orgs.map((o) => o.id)];

      // Fetch users with pagination
      const [users, total] = await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.organization', 'organization')
        .where('user.organizationId IN (:...orgIds)', { orgIds })
        .skip(pageOptionsDto.skip)
        .take(pageOptionsDto.take)
        .orderBy('user.created_at', pageOptionsDto.order)
        .getManyAndCount();

      return this.responseService.paginated(
        users,
        total,
        pageOptionsDto.page,
        pageOptionsDto.take,
        'Organization users fetched successfully',
      );
    } catch (err) {
      this.logger.error(`Error fetching sub-organization users: ${err}`);
      return this.responseService.error(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to fetch users',
      );
    }
  }
}

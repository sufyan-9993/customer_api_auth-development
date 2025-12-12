import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserPermissions } from './entities/userPermissions.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse, ResponseService } from '../../utils/response.utils';
import { HTTP_STATUS, MESSAGES, status } from '../../constants';
import { Organization } from '../organization/entities/organization.entity';
import { Role } from '../rbac/entities/role.entity';
import {
  UserAlreadyExistsException,
  UserInactiveException,
  UserNotFoundException,
} from '../../errors';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/user-profile.dto';
import { FindAllUserQueryDto } from './dto/FindAllUserQueryDto.dto';

import { UserProfileDto } from './dto/user-profile.dto';
import { JwtRequest } from '../auth/guards/JwtRequest ';
import { RevokeSessionDto } from './dto/session.dto';
import { UserSession } from './entities/userSession.entity';
import { generateExcelFile } from '../../utils/generateExcel';
import { FindOrgUserQueryDto } from './dto/FindOrgUserQueryDto.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(UserPermissions)
    private readonly userPermissionRepo: Repository<UserPermissions>,

    @InjectRepository(User)
    private readonly UserRepo: Repository<User>,
    @InjectRepository(Organization)
    private readonly OrgRepo: Repository<Organization>,
    @InjectRepository(Role)
    private readonly RoleRepo: Repository<Role>,
    @InjectRepository(UserSession)
    private readonly UserSessionRepo: Repository<UserSession>,

    private readonly responseService: ResponseService,
    // private readonly jwtService: JwtService,
  ) {}
  async createUser(reqUser: User, createUserDto: CreateUserDto) {
    try {
      const { subOrg, logs, users, roles, roleId, ...rest } = createUserDto;

      // --------------------------------------
      // 1. check the user Exists, org exists, role exists
      // --------------------------------------
      const existingUser = await this.UserRepo.findOne({
        where: { email: rest.email },
      });
      if (existingUser) {
        this.logger.log(`User already exists: ${rest.email}`);
        throw new UserAlreadyExistsException(
          `User with email ${rest.email} already exists`,
        );
      }

      const orgExists = await this.OrgRepo.findOne({
        where: { id: reqUser.organization.id },
      });
      if (!orgExists) {
        this.logger.log(`Organizatoin Not Found: ${reqUser.organization.id}`);
        throw new UserNotFoundException(
          `Organization Not Found: ${reqUser.organization.id}`,
        );
      }

      const roleExists = await this.RoleRepo.findOne({
        where: { id: roleId },
      });
      if (!roleExists) {
        this.logger.log(`Role Not Found: ${roleId}`);
        throw new UserNotFoundException(`Role Not Found: ${roleId}`);
      }
      const userEntity = this.UserRepo.create({
        ...rest,
        isTelesatUser: false,
        role: roleExists,
        organization: orgExists,
        createdBy: reqUser.id,
        updatedBy: reqUser.id,
      });
      const newUser = await this.UserRepo.save(userEntity);
      const permissionEntity = this.userPermissionRepo.create({
        user: newUser,
        subOrg,
        // pools,
        // plans,
        logs,
        users,
        roles,
        createdBy: reqUser.id,
        updatedBy: reqUser.id,
      });

      await this.userPermissionRepo.save(permissionEntity);

      return this.responseService.success(
        { user: newUser },
        'User created successfully',
      );
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('throwing custom error');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.responseService.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createTelesatUser(reqUser: User, createUserDto: CreateUserDto) {
    try {
      const { subOrg, logs, users, roles, roleId, ...rest } = createUserDto;

      // --------------------------------------
      // 1. check the user Exists, org exists, role exists
      // --------------------------------------
      const existingUser = await this.UserRepo.findOne({
        where: { email: rest.email },
      });
      if (existingUser) {
        this.logger.log(`User already exists: ${rest.email}`);
        throw new UserAlreadyExistsException(
          `User with email ${rest.email} already exists`,
        );
      }

      const roleExists = await this.RoleRepo.findOne({
        where: { id: roleId },
      });
      if (!roleExists) {
        this.logger.log(`Role Not Found: ${roleId}`);
        throw new UserNotFoundException(`Role Not Found: ${roleId}`);
      }

      const userEntity = this.UserRepo.create({
        ...rest,
        isTelesatUser: true,
        role: roleExists,
        createdBy: reqUser.id,
        updatedBy: reqUser.id,
      });
      const newUser = await this.UserRepo.save(userEntity);
      const permissionEntity = this.userPermissionRepo.create({
        user: newUser,
        subOrg,
        // pools,
        // plans,
        logs,
        users,
        roles,
        createdBy: reqUser.id,
        updatedBy: reqUser.id,
      });

      await this.userPermissionRepo.save(permissionEntity);

      return this.responseService.success(
        { user: newUser },
        'User created successfully',
      );
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('throwing custom error');
        throw err;
      }

      throw new HttpException(
        this.responseService.error(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          (err as Error).message,
        ),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOrgUsers(
    payload: FindOrgUserQueryDto,
    isDownload: boolean = false,
  ) {
    try {
      const {
        search,
        roleId,
        orgId,
        status,
        page = '1',
        limit = '10',
      } = payload;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const orgExists = await this.OrgRepo.findOne({
        where: { id: orgId },
      });
      if (!orgExists) {
        this.logger.log(`Organization Not Found for id: ${orgId}`);
        throw new UserAlreadyExistsException(
          `Organization Not Found for id: ${orgId}`,
        );
      }
      const qb = this.UserRepo.createQueryBuilder('user')
        .innerJoinAndSelect('user.role', 'role', 'role.status = :roleStatus', {
          roleStatus: 'ACTIVE',
        })
        .leftJoinAndSelect('user.organization', 'organization')
        .leftJoinAndSelect('user.permissions', 'permissions');

      // ---------------------------------
      // Search filters apply
      // ---------------------------------
      if (search) {
        qb.andWhere(
          `(user.fullName LIKE :search OR user.email LIKE :search OR user.phone LIKE :search)`,
          { search: `%${search}%` },
        );
      }

      if (roleId) {
        qb.andWhere(`role.id = :roleId`, { roleId });
      }

      qb.andWhere(`organization.id = :organizationId`, {
        organizationId: orgId,
      });

      if (status && status != 'all') {
        qb.andWhere(`user.status = :status`, { status });
      }

      // ---------------------------------
      // sorting
      // ---------------------------------
      qb.orderBy(`user.fullName`, 'ASC');

      // ---------------------------------
      // Execute query
      // ---------------------------------

      if (isDownload) {
        const users = await qb.getMany();
        const rows = users.map((u) => ({
          fullName: u.fullName,
          email: u.email,
          contact: `${u.countryCode || ''} ${u.phone || ''}`.trim(),
          role: u.role?.roleName ?? '',
          status: u.status,
        }));

        return await generateExcelFile(
          'Users',
          [
            { header: 'Full Name', key: 'fullName', width: 25 },
            { header: 'Admin Email', key: 'email', width: 30 },
            { header: 'Contact', key: 'contact', width: 18 },
            { header: 'Role', key: 'role', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
          ],
          rows,
        );
      } else {
        qb.skip((pageNum - 1) * limitNum).take(limitNum);
        const [results, total] = await qb.getManyAndCount();
        return this.responseService.paginated(
          results,
          total,
          pageNum,
          limitNum,
        );
      }
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('throwing custom error');
        throw err;
      }

      throw new HttpException(
        this.responseService.error(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          (err as Error).message,
        ),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    reqUser: User,
    payload: FindAllUserQueryDto,
    isDownload: boolean = false,
  ) {
    try {
      const { search, roleId, status, page = '1', limit = '10' } = payload;

      console.log('aljasl');
      const pageNum = Number(page);
      const limitNum = Number(limit);

      const qb = this.UserRepo.createQueryBuilder('user')
        .innerJoinAndSelect('user.role', 'role', 'role.status = :roleStatus', {
          roleStatus: 'ACTIVE',
        })
        .leftJoinAndSelect('user.organization', 'organization')
        .leftJoinAndSelect('user.permissions', 'permissions');

      // ---------------------------------
      // Search filters apply
      // ---------------------------------
      if (search) {
        qb.andWhere(
          `(user.fullName LIKE :search OR user.email LIKE :search OR user.phone LIKE :search)`,
          { search: `%${search}%` },
        );
      }

      if (roleId) {
        qb.andWhere(`role.id = :roleId`, { roleId });
      }
      if (reqUser.isTelesatUser == true) {
        qb.andWhere(`user.isTelesatUser = :isTelesatUser`, {
          isTelesatUser: true,
        });
      } else if (reqUser?.organization?.id) {
        qb.andWhere(`organization.id = :organizationId`, {
          organizationId: reqUser.organization.id,
        });
      } else {
        this.logger.log(`Organization not mapped properly to reqUser`);
        throw new Error('Internal Server Error');
      }

      if (status && status != 'all') {
        qb.andWhere(`user.status = :status`, { status });
      }

      // ---------------------------------
      // sorting
      // ---------------------------------
      qb.orderBy(`user.fullName`, 'ASC');

      // ---------------------------------
      // Execute query
      // ---------------------------------

      if (isDownload) {
        const users = await qb.getMany();
        const rows = users.map((u) => ({
          fullName: u.fullName,
          email: u.email,
          contact: `${u.countryCode || ''} ${u.phone || ''}`.trim(),
          role: u.role?.roleName ?? '',
          status: u.status,
        }));

        return await generateExcelFile(
          'Users',
          [
            { header: 'Full Name', key: 'fullName', width: 25 },
            { header: 'Admin Email', key: 'email', width: 30 },
            { header: 'Contact', key: 'contact', width: 18 },
            { header: 'Role', key: 'role', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
          ],
          rows,
        );
      } else {
        qb.skip((pageNum - 1) * limitNum).take(limitNum);
        const [results, total] = await qb.getManyAndCount();
        return this.responseService.paginated(
          results,
          total,
          pageNum,
          limitNum,
        );
      }
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('throwing custom error');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      this.logger.log(err);
      throw new HttpException(
        this.responseService.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(reqUser: User, id: string) {
    try {
      // --------------------------------------
      // 1. check the user Exists, org exists, role exists
      // --------------------------------------

      const filter: Record<string, unknown> = {
        id,
      };
      if (reqUser.isTelesatUser) {
        filter.isTelesatUser = true;
      } else {
        filter.organization = { id: reqUser.organization?.id };
      }
      console.log(filter);
      const existingUser = await this.UserRepo.findOne({
        where: filter,
        relations: ['role', 'organization', 'permissions'],
      });
      if (!existingUser) {
        this.logger.log(`User Not Found: ${id}`);
        throw new UserNotFoundException(`User Not Found: ${id}`);
      }

      return this.responseService.success(existingUser, MESSAGES.SUCCESS);
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('throwing custom error');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      this.logger.log(err);
      throw new HttpException(
        this.responseService.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      // Load the current user
      const user = await this.UserRepo.findOne({
        where: { id: userId, status: status.ACTIVE },
        relations: ['role', 'organization'],
      });

      // Check if user exists
      if (!user) {
        throw new UserNotFoundException(`User not found with id: ${userId}`);
      }

      // Check if email exists for another user (if email is being updated)
      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        const existingUser = await this.UserRepo.findOne({
          where: {
            email: updateProfileDto.email,
            id: Not(userId),
          },
        });

        if (existingUser) {
          this.logger.log(`User already exists: ${updateProfileDto.email}`);
          throw new UserAlreadyExistsException(
            `User with email ${updateProfileDto.email} already exists`,
          );
        }
      }

      // Update user fields from profile DTO
      const { roleId, ...userUpdateData } = updateProfileDto;

      // Handle role update if provided
      if (roleId) {
        const roleExists = await this.RoleRepo.findOne({
          where: { id: roleId },
        });

        if (!roleExists) {
          throw new UserNotFoundException(`Role not found with id: ${roleId}`);
        }

        user.role = roleExists;
      }

      Object.assign(user, userUpdateData);
      const updatedUser = await this.UserRepo.save(user);

      return this.responseService.success(
        updatedUser,
        'Profile updated successfully',
      );
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', err.message);
        throw err;
      }
      this.logger.error('Internal Server Error: ', (err as Error).message);
      throw new HttpException(
        this.responseService.error(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          'Failed to update profile',
        ),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateUser(reqUser: User, id: string, updateUserDto: UpdateUserDto) {
    try {
      const { subOrg, logs, users, roles, ...rest } = updateUserDto;

      // --------------------------------------
      // 1. Load the current user
      // --------------------------------------
      const filter: Record<string, unknown> = {
        id,
      };
      if (reqUser.isTelesatUser) {
        filter.isTelesatUser = true;
      } else {
        filter.organization = { id: reqUser.organization?.id };
      }
      const user = await this.UserRepo.findOne({
        where: filter,
        relations: ['role', 'organization'],
      });

      if (!user) {
        throw new UserNotFoundException(`User not found with id: ${id}`);
      }

      // --------------------------------------
      // 2. Check if email exists for another user
      // --------------------------------------
      if (rest.email) {
        const existingUser = await this.UserRepo.findOne({
          where: {
            email: rest.email,
            id: Not(id),
          },
        });

        if (existingUser) {
          this.logger.log(`User already exists: ${rest.email}`);
          throw new UserAlreadyExistsException(
            `User with email ${rest.email} already exists`,
          );
        }
      }

      // --------------------------------------
      // 3. Validate and update role
      // --------------------------------------
      if (rest.roleId) {
        const roleExists = await this.RoleRepo.findOne({
          where: { id: rest.roleId },
        });

        if (!roleExists) {
          this.logger.log(`Role Not Found: ${rest.roleId}`);
          throw new UserNotFoundException(`Role Not Found: ${rest.roleId}`);
        }

        user.role = roleExists;
        delete rest.roleId;
      }

      // --------------------------------------
      // 4. Apply remaining updates to user
      // --------------------------------------

      Object.assign(user, rest);
      this.logger.log(user, 'user to update');
      const updatedUser = await this.UserRepo.save(user);

      // --------------------------------------
      // 5. Update user permissions
      // --------------------------------------
      let permission = await this.userPermissionRepo.findOne({
        where: { user: { id } },
      });

      if (!permission) {
        // If no existing permission entry → create new
        this.logger.log(
          'Permissions not found for this user\nCreating permission.',
        );

        permission = this.userPermissionRepo.create({
          user: updatedUser,
        });
      }

      const updates: Record<string, unknown> = {};

      if (subOrg != null) updates.subOrg = subOrg;
      // if (pools != null) updates.pools = pools;
      // if (plans != null) updates.plans = plans;
      if (logs != null) updates.logs = logs;
      if (users != null) updates.users = users;
      if (roles != null) updates.roles = roles;

      Object.assign(permission, updates);

      await this.userPermissionRepo.save(permission);

      // --------------------------------------
      // 6. Successful response
      // --------------------------------------
      return this.responseService.success(
        updatedUser,
        'User updated successfully',
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', message);
        throw err;
      }
      this.logger.log('Internal Server Error: ', message);

      throw new HttpException(
        this.responseService.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deactivateUser(id: string) {
    try {
      // Fetch user
      const user = await this.UserRepo.findOne({
        where: { id },
      });

      if (!user) {
        throw new UserNotFoundException(`User not found with id: ${id}`);
      }

      // Already inactive?
      if (user.status === status.INACTIVE) {
        throw new UserInactiveException(`User is already deactivated`);
      }

      // Update the status
      user.status = status.INACTIVE;
      await this.UserRepo.save(user);

      return this.responseService.success(
        { id: user.id, status: user.status },
        'User deactivated successfully',
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', message);
        throw err;
      }
      this.logger.log('Internal Server Error: ', message);
      throw new HttpException(
        this.responseService.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async activateUser(id: string) {
    try {
      // Fetch user
      const user = await this.UserRepo.findOne({
        where: { id },
      });

      if (!user) {
        throw new UserNotFoundException(`User not found with id: ${id}`);
      }

      // Already inactive?
      if (user.status === status.ACTIVE) {
        throw new UserInactiveException(`User is already active`);
      }

      // Update the status
      user.status = status.ACTIVE;
      await this.UserRepo.save(user);

      return this.responseService.success(
        { id: user.id, status: user.status },
        'User activated successfully',
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (err instanceof HttpException) {
        this.logger.log('custom error handled: ', message);
        throw err;
      }
      this.logger.log('Internal Server Error: ', message);
      throw new HttpException(
        this.responseService.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findById(id: string) {
    return this.UserRepo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.UserRepo.findOne({ where: { email } });
  }

  save(user: User) {
    return this.UserRepo.save(user);
  }
  async getProfile(userId: string) {
    const user = await this.UserRepo.findOne({
      where: { id: userId },
      relations: ['organization', 'role'],
    });

    if (!user) {
      return this.responseService.error(
        HTTP_STATUS.NOT_FOUND,
        String(MESSAGES.USER_NOT_FOUND),
      );
    }

    const userRole = user.role
      ? await this.RoleRepo.findOne({ where: { id: user.role.id } })
      : null;

    const userProfile: UserProfileDto = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      countryCode: user.countryCode,
      organization: user.organization
        ? {
            id: user.organization.id,
            legal_name: user.organization.legal_name,
            trade_name: user.organization.trade_name,
          }
        : null,
      languagePreference: user.languagePreference || null,
      roleId: user.role ? user.role.id : null,
      role: userRole
        ? {
            id: userRole.id,
            roleName: userRole.roleName,
          }
        : null,
    };

    return this.responseService.success(
      userProfile,
      'User profile retrieved successfully',
    );
  }
  async getAccountStatus(userId: string) {
    try {
      const user = await this.UserRepo.findOne({
        where: { id: userId },
        relations: ['userSession'],
      });

      if (!user) {
        return this.responseService.error(
          HTTP_STATUS.NOT_FOUND,
          MESSAGES.USER_NOT_FOUND,
        );
      }

      const userSessions =
        user.userSession && Array.isArray(user.userSession)
          ? user.userSession
          : [];
      const sortedSessions = userSessions.sort(
        (a, b) =>
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime(),
      );

      const lastActivity =
        sortedSessions.length > 0 ? sortedSessions[0].lastActivity : null;

      return this.responseService.success({
        id: user.id,
        status: user.status,
        createdAt: user.createdAt,
        lastActivity,
      });
    } catch (err) {
      this.logger.error(
        `Error fetching account status: ${(err as Error).message}`,
      );
      throw new HttpException(
        this.responseService.error(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          'Failed to fetch account status',
        ),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await this.UserRepo.findOne({
        where: { id: userId },
        relations: ['role', 'organization', 'permissions'],
      });

      if (!user) {
        this.logger.warn(`User not found with ID: ${userId}`);
        return null;
      }

      return user;
    } catch (err) {
      this.logger.error(`Error fetching user by ID: ${(err as Error).message}`);
      return null;
    }
  }

  async getActiveSessions(req: JwtRequest) {
    try {
      const userId = req?.user.id;
      const sessions = await this.UserSessionRepo.find({
        where: { user: { id: userId }, status: status.ACTIVE },
        relations: ['deviceInfo'],
        order: { lastActivity: 'DESC' },
      });

      return this.responseService.success(sessions, 'Active sessions fetched');
    } catch (err) {
      this.logger.error(`Failed to fetch active sessions`, err);

      throw new HttpException(
        this.responseService.error(500, (err as Error).message),
        500,
      );
    }
  }

  // --------------------------------------------------------------------
  // REVOKE SINGLE SESSION
  // --------------------------------------------------------------------
  async revokeSession(
    req: JwtRequest,
    dto: RevokeSessionDto,
  ): Promise<ApiResponse<null>> {
    try {
      const userId = req.user.id;

      const session = await this.UserSessionRepo.findOne({
        where: {
          id: dto.sessionId,
          user: { id: userId },
          status: status.ACTIVE,
        },
      });

      if (!session) {
        return this.responseService.error(404, 'Session not found');
      }

      session.status = status.INACTIVE;
      session.revokedAt = new Date();
      session.isCurrent = false;

      await this.UserSessionRepo.save(session);

      return this.responseService.success(null, 'Session revoked');
    } catch (err) {
      this.logger.error(`Failed to revoke session ${dto.sessionId}`, err);

      throw new HttpException(
        this.responseService.error(500, (err as Error).message),
        500,
      );
    }
  }

  // --------------------------------------------------------------------
  // REVOKE ALL OTHER SESSIONS (except current)
  // --------------------------------------------------------------------
  async revokeAllOtherSessions(req: JwtRequest): Promise<ApiResponse<null>> {
    try {
      const userId = req.user.id;

      const current = await this.UserSessionRepo.findOne({
        where: { user: { id: userId }, isCurrent: true },
      });

      await this.UserSessionRepo.createQueryBuilder()
        .update(UserSession)
        .set({
          status: status.INACTIVE,
          revokedAt: new Date(),
          isCurrent: false,
        })
        .where('user_id = :userId', { userId })
        .andWhere('id != :curr', { curr: current?.id })
        .execute();

      return this.responseService.success(null, 'All other sessions revoked');
    } catch (err) {
      this.logger.error(`Failed to revoke other sessions`, err);

      throw new HttpException(
        this.responseService.error(500, (err as Error).message),
        500,
      );
    }
  }
}

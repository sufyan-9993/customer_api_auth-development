import {
  Controller,
  Get,
  Body,
  Param,
  Req,
  Put,
  Logger,
  Query,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/user-profile.dto';
import { FindAllUserQueryDto } from './dto/FindAllUserQueryDto.dto';
import type { Response } from 'express';

import { AuthGuard } from '../../common/guard/auth.guard';
import { Patch, Post, Res, UseGuards } from '@nestjs/common/decorators';
import { User } from './entities/user.entity';
import type { JwtRequest } from '../auth/guards/JwtRequest ';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RevokeSessionDto } from './dto/session.dto';
import { FindOrgUserQueryDto } from './dto/FindOrgUserQueryDto.dto';
import { status } from '../../constants';
import { StatusQueryDto } from '../common/dto/status.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('user')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly userService: UsersService) {}

  // create telesat user api - post
  @Post('')
  @ApiOperation({
    summary: 'Create user',
    description: 'create a new user',
  })
  async createUser(
    @Req() req: Request & { user: User },
    @Body() userDto: CreateUserDto,
  ) {
    if (req.user.isTelesatUser) {
      this.logger.log('In User controller - create telesat internal user');
      return await this.userService.createTelesatUser(req.user, userDto);
    } else {
      this.logger.log('In User controller - create telesat internal user');
      return await this.userService.createUser(req.user, userDto);
    }
  }

  // ==================== GET ====================
  // get all Org user api - get - this is only for telesate admin
  @Get('organization-users')
  @ApiOperation({
    summary: 'Get Organization User',
    description: 'Get Organization All Users In Excel File',
  })
  async FindOrgUser(@Query() payload: FindOrgUserQueryDto) {
    this.logger.log('In User controller - get all Org user');
    return await this.userService.findOrgUsers(payload);
  }
  // export all Org user api - get - this is only for telesate admin
  @Get('organization-users/export')
  @ApiOperation({
    summary: 'export Organization User',
    description: 'Export Organization All Users In Excel File',
  })
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename=OrganizationUsers.xlsx')
  async exportOrgUser(
    @Query() payload: FindOrgUserQueryDto,
    @Res() res: Response,
  ) {
    this.logger.log('In User controller - get all Org user');
    const buffer = await this.userService.findOrgUsers(payload, true);
    return res.send(buffer);
  }

  // get all user api - get
  @Get()
  @ApiOperation({
    summary: 'Get All Users',
    description: 'Get All Users',
  })
  async FindAllUser(
    @Req() req: Request & { user: User },
    @Query() payload: FindAllUserQueryDto,
  ) {
    this.logger.log('In User controller - get all user');
    return await this.userService.findAll(req.user, payload);
  }

  // export all user api - get
  @Get('/export')
  @ApiOperation({
    summary: 'Export users list',
    description: 'Exports user list as Excel with applied filters',
  })
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename=users.xlsx')
  async exportUsers(
    @Req() req: Request & { user: User },
    @Query() payload: FindAllUserQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.userService.findAll(req.user, payload, true);
    return res.send(buffer);
  }

  // get profile info
  @Get('profileInfo')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get profile information of the logged-in user',
  })
  async getProfile(@Req() req: Request & { user?: User }) {
    const userId = req.user?.id as string;
    try {
      this.logger.log('In User controller - get profile info');
      return await this.userService.getProfile(userId);
    } catch (error) {
      this.logger.error('Error fetching profile info', error);
      throw error;
    }
  }

  // get account status
  @Get('accountStatus')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get user account status',
    description: 'Get account status of the logged-in user',
  })
  async getAccountStatus(@Req() req: Request & { user?: User }) {
    const userId = req.user?.id as string;
    try {
      this.logger.log('In User controller - get account status');
      return await this.userService.getAccountStatus(userId);
    } catch (error) {
      this.logger.error('Error fetching account status', error);
      throw error;
    }
  }

  // get active sessions of user
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('activeSession')
  @ApiOperation({ summary: 'Get all active sessions of the user' })
  async getActiveSessions(@Req() req: JwtRequest) {
    this.logger.log('In User controller - get active sessions');
    return this.userService.getActiveSessions(req);
  }

  // get single user api - get
  @Get(':id')
  @ApiOperation({
    summary: 'Get User',
    description: 'Get User By Id',
  })
  async FindOneUser(
    @Req() req: Request & { user: User },
    @Param('id') id: string,
  ) {
    this.logger.log('In User controller - get single user');
    return await this.userService.findOne(req.user, id);
  }

  // ==================== PUT ====================
  // update profile
  @Put('profileInfo')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update profile information of the logged-in user',
  })
  async updateProfile(
    @Req() req: Request & { user?: User },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user?.id as string;
    try {
      this.logger.log('In User controller - update profile');
      return await this.userService.updateProfile(userId, updateProfileDto);
    } catch (error) {
      this.logger.error('Error updating profile', error);
      throw error;
    }
  }

  // deactivate user api - put
  @Put('updatestatus/:id')
  @ApiOperation({
    summary: 'Update user Status',
    description: 'Update user Status to activate/deactive by id',
  })
  async deactivateUser(@Param('id') id: string, @Body() query: StatusQueryDto) {
    this.logger.log('In User controller - change user status');
    if (query.status == status.INACTIVE)
      return await this.userService.deactivateUser(id);
    else return await this.userService.activateUser(id);
  }

  // // activate user api - put
  // @Put('activate/:id')
  // @ApiOperation({
  //   summary: 'activate user',
  //   description: 'activate a existing active user',
  // })
  // async activateUser(@Param('id') id: string) {
  //   this.logger.log('In User controller - activate user');
  //   return await this.userService.activateUser(id);
  // }

  // update user api - put
  @Put(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update a existing user',
  })
  async updateUser(
    @Req() req: Request & { user: User },
    @Param('id') id: string,
    @Body() userDto: UpdateUserDto,
  ) {
    this.logger.log('In User controller - update user');
    return await this.userService.updateUser(req.user, id, userDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('revokesessions')
  @ApiOperation({ summary: 'Revoke a single session by session ID' })
  async revokeSession(@Req() req: JwtRequest, @Body() dto: RevokeSessionDto) {
    this.logger.log('In User controller - revoke session');
    return this.userService.revokeSession(req, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('revokeAllSessions')
  @ApiOperation({ summary: 'Revoke all other sessions except current' })
  async revokeAllOtherSessions(@Req() req: JwtRequest) {
    this.logger.log('In User controller - revoke all other sessions');
    return this.userService.revokeAllOtherSessions(req);
  }
}

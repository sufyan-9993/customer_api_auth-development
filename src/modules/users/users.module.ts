import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserPermissions } from './entities/userPermissions.entity';
import { Organization } from '../organization/entities/organization.entity';
import { Role } from '../rbac/entities/role.entity';
import { AuthModule } from '../auth/auth.module';
import { UserSession } from './entities/userSession.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserPermissions,
      Organization,
      Role,
      UserSession,
    ]),
    forwardRef(() => AuthModule),
  ],

  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

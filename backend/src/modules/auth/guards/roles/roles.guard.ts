import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../../decorators/roles/roles.decorator';
import { Reflector } from '@nestjs/core';
import { ValidRoles } from '../../interfaces/valid-roles';
import { IS_PUBLIC_KEY } from '../../decorators/is-public/is-public.decorator';
import { UserWithRole } from '../../interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Is public route
    if (this.isPublic(context)) return true;

    // Get valid roles from decorator
    const validRoles = this.getValidRoles(context);

    // Get user with role from request
    const req = context.switchToHttp().getRequest();

    // If no user or no valid roles, return false
    if (!req.user || !validRoles) return false;

    // Check if user has a valid role
    if (this.hasRole(req.user, validRoles)) return true;

    // If user has no valid role, throw ForbiddenException
    throw new ForbiddenException(`User need a valid role.`);
  }

  private isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private getValidRoles(context: ExecutionContext): ValidRoles[] {
    return this.reflector.getAllAndOverride<ValidRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private hasRole(user: UserWithRole, validRoles: ValidRoles[]): boolean {
    const userRoles = user.role.map((role: any) => role.role);

    for (let i = 0; i < userRoles.length; i++) {
      const role = userRoles[i];
      if (role === ValidRoles.admin) return true;

      if (validRoles.includes(role)) return true;
    }

    return false;
  }
}

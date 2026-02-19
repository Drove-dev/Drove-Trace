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

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Validate if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // Validate if the route has a valid role
    const validRoles = this.reflector.getAllAndOverride<ValidRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!validRoles) return true;

    const req = context.switchToHttp().getRequest();

    if (!req.user) return false;

    const userRoles = req.user.role.map((role: any) => role.role);

    for (let i = 0; i < userRoles.length; i++) {
      const role = userRoles[i];
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(`User need a valid role.`);
  }
}

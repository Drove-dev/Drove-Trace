import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SdkKey } from '../../../sdk-keys/entities/sdk-key.entity';

@Injectable()
export class SdkGuard implements CanActivate {
  constructor(
    @InjectRepository(SdkKey)
    private readonly sdkKeyRepository: Repository<SdkKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sdkKey = request.body.sdkKey;

    if (!sdkKey) {
      throw new UnauthorizedException('API key is missing in body payload');
    }

    const sdkKeyEntity = await this.sdkKeyRepository.findOne({
      where: {
        key: sdkKey,
        isActive: true,
      },
      relations: ['project'],
    });

    if (!sdkKeyEntity) {
      throw new UnauthorizedException('Invalid or inactive SDK Key');
    }

    if (sdkKeyEntity.expiresAt && sdkKeyEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('SDK Key has expired');
    }

    // El proyecto es válido y se puede acceder vía sdkKeyEntity.project si fuera necesario
    return true;
  }
}

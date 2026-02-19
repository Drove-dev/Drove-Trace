import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/modules/projects/entities/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SdkGuard implements CanActivate {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sdkKey = request.body.sdkKey;

    if (!sdkKey)
      throw new UnauthorizedException('API key is missing in bodypayload');

    const project = await this.projectRepository.findOne({
      where: { sdkKey },
    });

    if (!project) {
      throw new UnauthorizedException('Invalid SDK Key');
    }

    return true;
  }
}

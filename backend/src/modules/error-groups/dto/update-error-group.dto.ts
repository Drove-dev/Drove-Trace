import { PartialType } from '@nestjs/swagger';
import { CreateErrorGroupDto } from './create-error-group.dto';

export class UpdateErrorGroupDto extends PartialType(CreateErrorGroupDto) {}

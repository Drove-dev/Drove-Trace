import { PartialType } from '@nestjs/swagger';
import { CreateSdkKeyDto } from './create-sdk-key.dto';

export class UpdateSdkKeyDto extends PartialType(CreateSdkKeyDto) {}

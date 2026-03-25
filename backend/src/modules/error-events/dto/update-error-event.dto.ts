import { PartialType } from '@nestjs/swagger';
import { CreateErrorEventDto } from './create-error-event.dto';

export class UpdateErrorEventDto extends PartialType(CreateErrorEventDto) {}

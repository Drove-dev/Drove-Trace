import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { PaginationDto } from '../../common/dtos/pagination';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { paginate } from '../../common/helpers/paginate.helper';

import { UpdateSdkKeyDto } from './dto/update-sdk-key.dto';
import { SdkKeyResponseDto } from './dto/sdk-key-response.dto';
import { SdkKey } from './entities/sdk-key.entity';

@Injectable()
export class SdkKeysService {
  constructor(
    @InjectRepository(SdkKey)
    private readonly sdkKeyRepository: Repository<SdkKey>,
  ) {}

  private async findEntityById(id: string): Promise<SdkKey> {
    const sdkKey = await this.sdkKeyRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!sdkKey) {
      throw new NotFoundException(`SdkKey with id ${id} not found`);
    }

    return sdkKey;
  }

  async findAll(query: PaginationDto): Promise<PaginatedResponseDto<SdkKeyResponseDto>> {
    const { search } = query;

    const options = {
      where: search ? { name: ILike(`%${search}%`) } : {},
      relations: ['project'],
    };

    const paginatedResult = await paginate(
      this.sdkKeyRepository,
      query,
      options,
    );

    // Mapeo manual debido a HAS_RELATIONS = true para asegurar consistencia con instanceToPlain
    const plainData = paginatedResult.data.map((item) => instanceToPlain(item));
    const data = plainToInstance(SdkKeyResponseDto, plainData, {
      excludeExtraneousValues: true,
    });

    return {
      ...paginatedResult,
      data,
    };
  }

  async findOne(id: string): Promise<SdkKeyResponseDto> {
    const entity = await this.findEntityById(id);
    return plainToInstance(SdkKeyResponseDto, instanceToPlain(entity), {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, updateSdkKeyDto: UpdateSdkKeyDto): Promise<SdkKeyResponseDto> {
    const entity = await this.findEntityById(id);

    // Asignar campos editables (solo isActive en este caso)
    Object.assign(entity, updateSdkKeyDto);

    await this.sdkKeyRepository.save(entity);

    // Recargar para asegurar hidratación de relaciones
    const updatedEntity = await this.findEntityById(id);

    return plainToInstance(SdkKeyResponseDto, instanceToPlain(updatedEntity), {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findEntityById(id);
    await this.sdkKeyRepository.remove(entity);
  }

  async findOneByKey(key: string): Promise<SdkKey> {
    const sdkKey = await this.sdkKeyRepository.findOne({
      where: { key },
      relations: ['project'],
    });

    if (!sdkKey) {
      throw new NotFoundException(`SdkKey with key ${key} not found`);
    }

    return sdkKey;
  }
}

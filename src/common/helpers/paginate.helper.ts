import { Repository, FindManyOptions, ObjectLiteral } from 'typeorm';
import { PaginationDto } from '../dtos/pagination';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { plainToInstance } from 'class-transformer';

export async function paginate<T extends ObjectLiteral, D = T>(
  repository: Repository<T>,
  query: PaginationDto,
  options: FindManyOptions<T> = {},
  dtoClass?: new (...args: any[]) => D,
): Promise<PaginatedResponseDto<D>> {
  const page = query.page || 1;
  const limit = query.limit || 15;
  const skip = (page - 1) * limit;
  const take = limit;

  const findOptions: FindManyOptions<T> = {
    ...options,
    skip,
    take,
  };

  const [rawData, total] = await repository.findAndCount(findOptions);

  let data: D[];
  if (dtoClass) {
    data = plainToInstance(dtoClass, rawData, {
      excludeExtraneousValues: true,
    }) as unknown as D[];
  } else {
    data = rawData as unknown as D[];
  }

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

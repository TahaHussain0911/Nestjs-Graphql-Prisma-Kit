import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from 'src/common/dto/pagination-query';
import { DTOTrim } from 'src/utils/helper';

@InputType()
export class QueryCategoryInput extends PaginationQuery {
  @Field()
  @IsOptional()
  @IsString()
  @Transform(DTOTrim)
  search?: string;
}

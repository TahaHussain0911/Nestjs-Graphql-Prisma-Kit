import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQuery } from 'src/common/dto/pagination-query';
import { DTOTrim } from 'src/utils/helper';

@InputType()
export class QueryProductInput extends PaginationQuery {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(DTOTrim)
  search?: string;

  @Field({ nullable: true })
  @IsUUID()
  categoryId?: string;
}

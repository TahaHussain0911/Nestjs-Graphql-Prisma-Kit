import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateProductInput } from './dto/create-product-input';
import {
  ProductPaginatedResponse,
  ProductResponse,
} from './dto/product-response';
import { UpdateProductInput } from './dto/update-product-input';
import { IsPublic } from 'src/common/decorators/public.decorator';
import { QueryProductInput } from './dto/query-product-input';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Roles(Role.ADMIN)
  @Mutation(() => ProductResponse)
  create(@Args('input') createProductInput: CreateProductInput) {
    return this.productService.create(createProductInput);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => ProductResponse)
  update(@Args('input') updateProductInput: UpdateProductInput) {
    return this.productService.update(updateProductInput);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => ProductResponse)
  delete(@Args('id') id: string) {
    return this.productService.delete(id);
  }

  @IsPublic()
  @Query(() => ProductResponse)
  findOne(@Args('id') id: string) {
    return this.productService.findOne(id);
  }

  @IsPublic()
  @Query(() => ProductPaginatedResponse)
  findAll(@Args('query') queryProductInput: QueryProductInput) {
    return this.productService.findAll(queryProductInput);
  }
}

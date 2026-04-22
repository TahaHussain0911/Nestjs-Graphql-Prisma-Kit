import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CategoryResponse } from './dto/category-response';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateCategoryInput } from './dto/update-category-input';
import { IsPublic } from 'src/common/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver()
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(Role.ADMIN)
  @Mutation(() => CategoryResponse)
  create(@Args('input') createCategoryInput) {
    return this.categoryService.create(createCategoryInput);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => CategoryResponse)
  update(@Args('input') updateCategoryInput: UpdateCategoryInput) {
    return this.categoryService.update(updateCategoryInput);
  }

  @IsPublic()
  @Query(() => CategoryResponse)
  findOne(@Args('id') id: string) {
    return this.categoryService.findOne(id);
  }
}

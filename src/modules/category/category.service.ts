import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryInput } from './dto/create-category-input';
import { createSlug } from 'src/utils/helper';
import { UpdateCategoryInput } from './dto/update-category-input';
import { Prisma } from '@prisma/client';
import { QueryCategoryInput } from './dto/query-category-input';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryInput: CreateCategoryInput) {
    const { title, ...rest } = createCategoryInput;
    const slug = await this.validateSlug(title);
    const category = await this.prisma.category.create({
      data: {
        title,
        slug,
        ...rest,
      },
    });
    return { category };
  }

  async update(updateCategoryInput: UpdateCategoryInput) {
    const { id, title, ...rest } = updateCategoryInput;
    const category = (await this.findOne(id)).category;
    const updatedCategoryData: Prisma.CategoryUpdateInput = {
      ...rest,
    };
    if (title && category.title !== title) {
      const slug = await this.validateSlug(title);
      updatedCategoryData.title = title;
      updatedCategoryData.slug = slug;
    }
    const updatedCategory = await this.prisma.category.update({
      where: {
        id,
      },
      data: updatedCategoryData,
    });
    return {
      category: updatedCategory,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return { category };
  }

  async findAll(queryCategoryInput: QueryCategoryInput) {
    const { search, page = 1, limit = 20 } = queryCategoryInput;

    const where: Prisma.CategoryWhereInput = {};
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.prisma.category.delete({
      where: {
        id,
      },
    });
    return {
      category,
    };
  }

  private async validateSlug(title: string): Promise<string> {
    const slug = createSlug(title);
    const slugTaken = await this.prisma.category.findUnique({
      where: {
        slug,
      },
    });
    if (slugTaken) {
      throw new ConflictException('Category already exists');
    }
    return slug;
  }
}

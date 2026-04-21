import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryInput } from './dto/create-category-input';
import { createSlug } from 'src/utils/helper';

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

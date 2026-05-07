import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductInput } from './dto/create-product-input';
import { Category, Prisma, Product } from '@prisma/client';
import { UpdateProductInput } from './dto/update-product-input';
import { QueryProductInput } from './dto/query-product-input';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductInput: CreateProductInput) {
    await this.validateSKU(createProductInput.sku);
    await this.validateCategory(createProductInput.categoryId);
    const product = await this.prisma.product.create({
      data: {
        ...createProductInput,
        price: new Prisma.Decimal(createProductInput.price),
      },
      include: {
        category: true,
      },
    });
    return {
      product,
    };
  }

  async update(updateProductInput: UpdateProductInput) {
    const { id, categoryId, sku, price, ...restProduct } = updateProductInput;
    const product = (await this.findOne(id))?.product;
    const productUpdateFields: Prisma.ProductUpdateInput = {
      ...restProduct,
    };
    if (sku && product.sku !== sku) {
      await this.validateSKU(sku);
      productUpdateFields.sku = sku;
    }
    if (categoryId && product.category.id !== categoryId) {
      await this.validateCategory(categoryId);
      productUpdateFields.category = {
        connect: {
          id: categoryId,
        },
      };
    }
    if (price) {
      productUpdateFields.price = new Prisma.Decimal(price);
    }
    const updatedProduct = await this.prisma.product.update({
      where: {
        id,
      },
      data: productUpdateFields,
      include: {
        category: true,
      },
    });
    return {
      product: updatedProduct,
    };
  }

  async delete(id: string) {
    const product = (await this.findOne(id)).product;
    await this.prisma.product.delete({
      where: {
        id,
      },
    });
    return {
      product,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      product,
    };
  }

  async findAll(queryProductInput: QueryProductInput) {
    const { categoryId, search, page = 1, limit = 20 } = queryProductInput;
    const where: Prisma.ProductWhereInput = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
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
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
        },
      }),
    ]);
    return {
      page,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  private async validateCategory(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!category) {
      throw new BadRequestException('Category not found!');
    }
  }

  private async validateSKU(sku: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        sku,
      },
    });
    if (product) {
      throw new ConflictException('Product with this sku already exists!');
    }
  }
}

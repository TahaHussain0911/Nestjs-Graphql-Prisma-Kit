import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from 'src/modules/category/entities/category.entity';

@ObjectType()
export class Product {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  price: number;

  @Field()
  sku: string;

  @Field()
  stock: number;

  @Field()
  isActive: boolean;

  @Field()
  category: Category;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

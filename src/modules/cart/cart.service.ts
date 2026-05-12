import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveCart(userId: string) {
    const cart = await this.findOrCreateActiveCart(userId);
    return cart;
  }
  async findOrCreateActiveCart(userId: string) {
    const cartInclude: Prisma.CartInclude = {
      cartItems: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              description: true,
              imageUrl: true,
            },
          },
        },
      },
    };
    let userCart = await this.prisma.cart.findFirst({
      where: {
        userId,
        checkedOut: false,
      },
      include: cartInclude,
    });
    if (!userCart) {
      userCart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: cartInclude,
      });
    }
    return userCart;
  }
}

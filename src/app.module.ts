import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { TypedConfigModule } from './config/typed-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './modules/upload/upload.module';
@Module({
  imports: [
    TypedConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      sortSchema: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    MailModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

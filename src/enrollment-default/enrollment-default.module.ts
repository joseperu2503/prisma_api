import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { EnrollmentDefaultController } from './controllers/enrollment-default.controller';
import { DefaultPlan } from './entities/default-plan.entity';
import { DefaultProduct } from './entities/default-product.entity';
import { EnrollmentDefaultService } from './services/enrollment-default.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DefaultProduct, DefaultPlan]),
    AuthModule,
  ],
  controllers: [EnrollmentDefaultController],
  providers: [EnrollmentDefaultService],
  exports: [EnrollmentDefaultService],
})
export class EnrollmentDefaultModule {}

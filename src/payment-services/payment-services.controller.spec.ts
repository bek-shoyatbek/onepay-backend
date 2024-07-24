import { Test, TestingModule } from '@nestjs/testing';
import { PaymentServicesController } from './payment-services.controller';
import { PrismaService } from 'src/prisma.service';

describe('PaymentServicesController', () => {
  let controller: PaymentServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentServicesController],
      providers: [PrismaService],
    }).compile();

    controller = module.get<PaymentServicesController>(
      PaymentServicesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

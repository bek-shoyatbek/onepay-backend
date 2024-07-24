import { Test, TestingModule } from '@nestjs/testing';
import { PaymentServicesService } from './payment-services.service';

describe('PaymentServicesService', () => {
  let service: PaymentServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentServicesService],
    }).compile();

    service = module.get<PaymentServicesService>(PaymentServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

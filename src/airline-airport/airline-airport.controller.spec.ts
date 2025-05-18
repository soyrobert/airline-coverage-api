import { Test, TestingModule } from '@nestjs/testing';
import { AirlineAirportController } from './airline-airport.controller';

describe('AirlineAirportController', () => {
  let controller: AirlineAirportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirlineAirportController],
    }).compile();

    controller = module.get<AirlineAirportController>(AirlineAirportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AirportEntity } from './airport.entity/airport.entity';
import { AirportController } from './airport.controller';
import { AirportService } from './airport.service';
import { faker } from '@faker-js/faker';

describe('AirportController', () => {
  let controller: AirportController;
  let repository: Repository<AirportEntity>;
  let airportsList: AirportEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      controllers: [AirportController],
      providers: [AirportService],
    }).compile();

    controller = module.get<AirportController>(AirportController);
    repository = module.get<Repository<AirportEntity>>(
      getRepositoryToken(AirportEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    airportsList = [];

    for (let i = 0; i < 5; i++) {
      const airport: AirportEntity = await repository.save({
        name: faker.location.city() + ' International Airport',
        code: faker.string.alpha(3).toUpperCase(),
        country: faker.location.country(),
        city: faker.location.city(),
      });
      airportsList.push(airport);
    }
  };

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('findAll debería retornar todos los aeropuertos', async () => {
    const result = await controller.findAll();
    expect(result).not.toBeNull();
    expect(result.length).toBe(airportsList.length);
  });

  it('findOne debería retornar un aeropuerto por id', async () => {
    const storedAirport: AirportEntity = airportsList[0];
    const result = await controller.findOne(storedAirport.id);
    expect(result).not.toBeNull();
    expect(result.id).toBe(storedAirport.id);
    expect(result.name).toBe(storedAirport.name);
  });

  it('create debería retornar un nuevo aeropuerto', async () => {
    const airportDto = {
      name: faker.location.city() + ' International Airport',
      code: 'XYZ',
      country: faker.location.country(),
      city: faker.location.city(),
    };

    const result = await controller.create(airportDto);
    expect(result).not.toBeNull();
    expect(result.name).toBe(airportDto.name);
    expect(result.code).toBe(airportDto.code);
    expect(result.country).toBe(airportDto.country);
  });

  it('update debería modificar un aeropuerto', async () => {
    const airport = airportsList[0];

    const airportDto = {
      name: 'Aeropuerto actualizado',
      code: 'UPD',
      country: 'País actualizado',
      city: 'Ciudad actualizada',
    };

    const result = await controller.update(airport.id, airportDto);
    expect(result).not.toBeNull();
    expect(result.name).toBe(airportDto.name);
    expect(result.code).toBe(airportDto.code);
    expect(result.country).toBe(airportDto.country);
  });

  it('delete debería eliminar un aeropuerto', async () => {
    const airport = airportsList[0];
    await controller.delete(airport.id);

    const storedAirport = await repository.findOne({
      where: { id: airport.id },
    });
    expect(storedAirport).toBeNull();
  });
});

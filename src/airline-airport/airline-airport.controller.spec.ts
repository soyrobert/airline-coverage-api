import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AirlineEntity } from '../airline/airline.entity/airline.entity';
import { AirportEntity } from '../airport/airport.entity/airport.entity';
import { AirlineAirportController } from './airline-airport.controller';
import { AirlineAirportService } from './airline-airport.service';
import { faker } from '@faker-js/faker';

describe('AirlineAirportController', () => {
  let controller: AirlineAirportController;
  let airlineRepository: Repository<AirlineEntity>;
  let airportRepository: Repository<AirportEntity>;
  let airline: AirlineEntity;
  let airportsList: AirportEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      controllers: [AirlineAirportController],
      providers: [AirlineAirportService],
    }).compile();

    controller = module.get<AirlineAirportController>(AirlineAirportController);
    airlineRepository = module.get<Repository<AirlineEntity>>(
      getRepositoryToken(AirlineEntity),
    );
    airportRepository = module.get<Repository<AirportEntity>>(
      getRepositoryToken(AirportEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    airportRepository.clear();
    airlineRepository.clear();

    airportsList = [];
    for (let i = 0; i < 5; i++) {
      const airport: AirportEntity = await airportRepository.save({
        name: faker.location.city() + ' International Airport',
        code: faker.string.alpha(3).toUpperCase(),
        country: faker.location.country(),
        city: faker.location.city(),
      });
      airportsList.push(airport);
    }

    airline = await airlineRepository.save({
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      foundationDate: faker.date.past(),
      website: faker.internet.url(),
      airports: airportsList,
    });
  };

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('addAirportToAirline debería agregar un aeropuerto a una aerolínea', async () => {
    const newAirport: AirportEntity = await airportRepository.save({
      name: faker.location.city() + ' International Airport',
      code: faker.string.alpha(3).toUpperCase(),
      country: faker.location.country(),
      city: faker.location.city(),
    });

    const result = await controller.addAirportToAirline(
      airline.id,
      newAirport.id,
    );

    expect(result).not.toBeNull();
    expect(result.airports.some((a) => a.id === newAirport.id)).toBeTruthy();
  });

  it('findAirportsFromAirline debería retornar todos los aeropuertos de una aerolínea', async () => {
    const result = await controller.findAirportsFromAirline(airline.id);

    expect(result).not.toBeNull();
    expect(result.length).toBe(airportsList.length);
    expect(result.map((a) => a.id).sort()).toEqual(
      airportsList.map((a) => a.id).sort(),
    );
  });

  it('findAirportFromAirline debería retornar un aeropuerto específico de una aerolínea', async () => {
    const airport = airportsList[0];
    const result = await controller.findAirportFromAirline(
      airline.id,
      airport.id,
    );

    expect(result).not.toBeNull();
    expect(result.id).toBe(airport.id);
    expect(result.name).toBe(airport.name);
  });

  it('updateAirportsFromAirline debería actualizar los aeropuertos de una aerolínea', async () => {
    const newAirport: AirportEntity = await airportRepository.save({
      name: faker.location.city() + ' International Airport',
      code: faker.string.alpha(3).toUpperCase(),
      country: faker.location.country(),
      city: faker.location.city(),
    });

    const updatedAirports = [newAirport];
    const result = await controller.updateAirportsFromAirline(
      airline.id,
      updatedAirports,
    );

    expect(result).not.toBeNull();
    expect(result.airports.length).toBe(1);
    expect(result.airports[0].id).toBe(newAirport.id);
  });

  it('deleteAirportFromAirline debería eliminar un aeropuerto de una aerolínea', async () => {
    const airport = airportsList[0];
    await controller.deleteAirportFromAirline(airline.id, airport.id);

    const updatedAirline = await airlineRepository.findOne({
      where: { id: airline.id },
      relations: ['airports'],
    });

    expect(
      updatedAirline.airports.some((a) => a.id === airport.id),
    ).toBeFalsy();
  });
});

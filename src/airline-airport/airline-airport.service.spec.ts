import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AirlineEntity } from '../airline/airline.entity/airline.entity';
import { AirportEntity } from '../airport/airport.entity/airport.entity';
import { AirlineAirportService } from './airline-airport.service';
import { faker } from '@faker-js/faker';

describe('AirlineAirportService', () => {
  let service: AirlineAirportService;
  let airlineRepository: Repository<AirlineEntity>;
  let airportRepository: Repository<AirportEntity>;
  let airline: AirlineEntity;
  let airportsList: AirportEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AirlineAirportService],
    }).compile();

    service = module.get<AirlineAirportService>(AirlineAirportService);
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
    expect(service).toBeDefined();
  });

  it('addAirportToAirline debería agregar un aeropuerto a una aerolínea', async () => {
    const newAirport: AirportEntity = await airportRepository.save({
      name: faker.location.city() + ' International Airport',
      code: faker.string.alpha(3).toUpperCase(),
      country: faker.location.country(),
      city: faker.location.city(),
    });

    const newAirline: AirlineEntity = await airlineRepository.save({
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      foundationDate: faker.date.past(),
      website: faker.internet.url(),
    });

    const result: AirlineEntity = await service.addAirportToAirline(
      newAirline.id,
      newAirport.id,
    );

    expect(result.airports.length).toBe(1);
    expect(result.airports[0].id).toBe(newAirport.id);
    expect(result.airports[0].name).toBe(newAirport.name);
    expect(result.airports[0].code).toBe(newAirport.code);
    expect(result.airports[0].country).toBe(newAirport.country);
    expect(result.airports[0].city).toBe(newAirport.city);
  });

  it('addAirportToAirline debería lanzar una excepción para un aeropuerto inválido', async () => {
    const newAirline: AirlineEntity = await airlineRepository.save({
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      foundationDate: faker.date.past(),
      website: faker.internet.url(),
    });

    await expect(() =>
      service.addAirportToAirline(newAirline.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró el aeropuerto con el id proporcionado',
    );
  });

  it('addAirportToAirline debería lanzar una excepción para una aerolínea inválida', async () => {
    const newAirport: AirportEntity = await airportRepository.save({
      name: faker.location.city() + ' International Airport',
      code: faker.string.alpha(3).toUpperCase(),
      country: faker.location.country(),
      city: faker.location.city(),
    });

    await expect(() =>
      service.addAirportToAirline('0', newAirport.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la aerolínea con el id proporcionado',
    );
  });

  it('findAirportsFromAirline debería retornar aeropuertos por aerolínea', async () => {
    const airports: AirportEntity[] = await service.findAirportsFromAirline(
      airline.id,
    );
    expect(airports).not.toBeNull();
    expect(airports).toHaveLength(airportsList.length);
  });

  it('findAirportsFromAirline debería lanzar una excepción para una aerolínea inválida', async () => {
    await expect(() =>
      service.findAirportsFromAirline('0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la aerolínea con el id proporcionado',
    );
  });

  it('findAirportFromAirline debería retornar un aeropuerto por aerolínea', async () => {
    const airport: AirportEntity = airportsList[0];
    const storedAirport: AirportEntity = await service.findAirportFromAirline(
      airline.id,
      airport.id,
    );

    expect(storedAirport).not.toBeNull();
    expect(storedAirport.id).toBe(airport.id);
    expect(storedAirport.name).toBe(airport.name);
    expect(storedAirport.code).toBe(airport.code);
    expect(storedAirport.country).toBe(airport.country);
    expect(storedAirport.city).toBe(airport.city);
  });

  it('findAirportFromAirline debería lanzar una excepción para un aeropuerto inválido', async () => {
    await expect(() =>
      service.findAirportFromAirline(airline.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró el aeropuerto con el id proporcionado',
    );
  });

  it('findAirportFromAirline debería lanzar una excepción para una aerolínea inválida', async () => {
    const airport: AirportEntity = airportsList[0];
    await expect(() =>
      service.findAirportFromAirline('0', airport.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la aerolínea con el id proporcionado',
    );
  });

  it('findAirportFromAirline debería lanzar una excepción para un aeropuerto no asociado a la aerolínea', async () => {
    const newAirport: AirportEntity = await airportRepository.save({
      name: faker.location.city() + ' International Airport',
      code: faker.string.alpha(3).toUpperCase(),
      country: faker.location.country(),
      city: faker.location.city(),
    });

    await expect(() =>
      service.findAirportFromAirline(airline.id, newAirport.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró el aeropuerto con el id proporcionado en la aerolínea',
    );
  });

  it('updateAirportsFromAirline debería actualizar los aeropuertos de una aerolínea', async () => {
    const newAirport: AirportEntity = await airportRepository.save({
      name: faker.location.city() + ' International Airport',
      code: faker.string.alpha(3).toUpperCase(),
      country: faker.location.country(),
      city: faker.location.city(),
    });

    const updatedAirline: AirlineEntity =
      await service.updateAirportsFromAirline(airline.id, [newAirport]);

    expect(updatedAirline.airports.length).toBe(1);
    expect(updatedAirline.airports[0].id).toBe(newAirport.id);
    expect(updatedAirline.airports[0].name).toBe(newAirport.name);
    expect(updatedAirline.airports[0].code).toBe(newAirport.code);
    expect(updatedAirline.airports[0].country).toBe(newAirport.country);
    expect(updatedAirline.airports[0].city).toBe(newAirport.city);
  });

  it('updateAirportsFromAirline debería lanzar una excepción para una aerolínea inválida', async () => {
    const newAirport: AirportEntity = await airportRepository.save({
      name: faker.location.city() + ' International Airport',
      code: faker.string.alpha(3).toUpperCase(),
      country: faker.location.country(),
      city: faker.location.city(),
    });

    await expect(() =>
      service.updateAirportsFromAirline('0', [newAirport]),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la aerolínea con el id proporcionado',
    );
  });

  it('updateAirportsFromAirline debería lanzar una excepción para un aeropuerto inválido', async () => {
    const airport: AirportEntity = airportsList[0];
    airport.id = '0';

    await expect(() =>
      service.updateAirportsFromAirline(airline.id, [airport]),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró el aeropuerto con el id proporcionado',
    );
  });

  it('deleteAirportFromAirline debería eliminar un aeropuerto de una aerolínea', async () => {
    const airport: AirportEntity = airportsList[0];

    await service.deleteAirportFromAirline(airline.id, airport.id);

    const updatedAirline: AirlineEntity = await airlineRepository.findOne({
      where: { id: airline.id },
      relations: ['airports'],
    });

    const deletedAirport = updatedAirline.airports.find(
      (a) => a.id === airport.id,
    );

    expect(deletedAirport).toBeUndefined();
  });

  it('deleteAirportFromAirline debería lanzar una excepción para un aeropuerto inválido', async () => {
    await expect(() =>
      service.deleteAirportFromAirline(airline.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró el aeropuerto con el id proporcionado',
    );
  });

  it('deleteAirportFromAirline debería lanzar una excepción para una aerolínea inválida', async () => {
    const airport: AirportEntity = airportsList[0];
    await expect(() =>
      service.deleteAirportFromAirline('0', airport.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la aerolínea con el id proporcionado',
    );
  });

  it('deleteAirportFromAirline debería lanzar una excepción para un aeropuerto no asociado', async () => {
    const newAirport: AirportEntity = await airportRepository.save({
      name: faker.location.city() + ' International Airport',
      code: faker.string.alpha(3).toUpperCase(),
      country: faker.location.country(),
      city: faker.location.city(),
    });

    await expect(() =>
      service.deleteAirportFromAirline(airline.id, newAirport.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró el aeropuerto con el id proporcionado en la aerolínea',
    );
  });
});

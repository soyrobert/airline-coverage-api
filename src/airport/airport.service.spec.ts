import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AirportEntity } from './airport.entity/airport.entity';
import { AirportService } from './airport.service';
import { faker } from '@faker-js/faker';

describe('AirportService', () => {
  let service: AirportService;
  let repository: Repository<AirportEntity>;
  let airportsList: AirportEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AirportService],
    }).compile();

    service = module.get<AirportService>(AirportService);
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
    expect(service).toBeDefined();
  });

  it('findAll debería retornar todos los aeropuertos', async () => {
    const airports: AirportEntity[] = await service.findAll();
    expect(airports).not.toBeNull();
    expect(airports).toHaveLength(airportsList.length);
  });

  it('findOne debería retornar un aeropuerto por id', async () => {
    const storedAirport: AirportEntity = airportsList[0];
    const airport: AirportEntity = await service.findOne(storedAirport.id);
    expect(airport).not.toBeNull();
    expect(airport.name).toEqual(storedAirport.name);
    expect(airport.code).toEqual(storedAirport.code);
    expect(airport.country).toEqual(storedAirport.country);
    expect(airport.city).toEqual(storedAirport.city);
  });

  it('findOne debería lanzar una excepción para un aeropuerto inválido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'No se encontró el aeropuerto con el id proporcionado',
    );
  });

  it('create debería retornar un nuevo aeropuerto', async () => {
    const airport: AirportEntity = {
      id: '',
      name: faker.location.city() + ' International Airport',
      code: 'ABC',
      country: faker.location.country(),
      city: faker.location.city(),
      airlines: [],
    };

    const newAirport: AirportEntity = await service.create(airport);
    expect(newAirport).not.toBeNull();

    const storedAirport: AirportEntity = await repository.findOne({
      where: { id: newAirport.id },
    });
    expect(storedAirport).not.toBeNull();
    expect(storedAirport.name).toEqual(newAirport.name);
    expect(storedAirport.code).toEqual(newAirport.code);
    expect(storedAirport.country).toEqual(newAirport.country);
    expect(storedAirport.city).toEqual(newAirport.city);
  });

  it('create debería lanzar una excepción para un código con longitud diferente a 3 caracteres', async () => {
    const airport: AirportEntity = {
      id: '',
      name: faker.location.city() + ' International Airport',
      code: 'ABCD',
      country: faker.location.country(),
      city: faker.location.city(),
      airlines: [],
    };

    await expect(() => service.create(airport)).rejects.toHaveProperty(
      'message',
      'El código del aeropuerto debe tener exactamente 3 caracteres',
    );
  });

  it('update debería modificar un aeropuerto', async () => {
    const airport: AirportEntity = airportsList[0];
    airport.name = 'Nuevo nombre';
    airport.city = 'Nueva ciudad';

    const updatedAirport: AirportEntity = await service.update(
      airport.id,
      airport,
    );
    expect(updatedAirport).not.toBeNull();

    const storedAirport: AirportEntity = await repository.findOne({
      where: { id: airport.id },
    });
    expect(storedAirport).not.toBeNull();
    expect(storedAirport.name).toEqual(airport.name);
    expect(storedAirport.city).toEqual(airport.city);
  });

  it('update debería lanzar una excepción para un aeropuerto inválido', async () => {
    let airport: AirportEntity = airportsList[0];
    airport = {
      ...airport,
      name: 'Nuevo nombre',
      city: 'Nueva ciudad',
    };
    await expect(() => service.update('0', airport)).rejects.toHaveProperty(
      'message',
      'No se encontró el aeropuerto con el id proporcionado',
    );
  });

  it('update debería lanzar una excepción para un código con longitud diferente a 3 caracteres', async () => {
    const airport: AirportEntity = airportsList[0];
    airport.code = 'ABCD';

    await expect(() =>
      service.update(airport.id, airport),
    ).rejects.toHaveProperty(
      'message',
      'El código del aeropuerto debe tener exactamente 3 caracteres',
    );
  });

  it('delete debería eliminar un aeropuerto', async () => {
    const airport: AirportEntity = airportsList[0];
    await service.delete(airport.id);

    const deletedAirport: AirportEntity = await repository.findOne({
      where: { id: airport.id },
    });
    expect(deletedAirport).toBeNull();
  });

  it('delete debería lanzar una excepción para un aeropuerto inválido', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'No se encontró el aeropuerto con el id proporcionado',
    );
  });
});

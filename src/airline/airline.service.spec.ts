import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AirlineEntity } from './airline.entity/airline.entity';
import { AirlineService } from './airline.service';
import { faker } from '@faker-js/faker';
// import { BusinessError } from '../shared/errors/business-errors';

describe('AirlineService', () => {
  let service: AirlineService;
  let repository: Repository<AirlineEntity>;
  let airlinesList: AirlineEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AirlineService],
    }).compile();

    service = module.get<AirlineService>(AirlineService);
    repository = module.get<Repository<AirlineEntity>>(
      getRepositoryToken(AirlineEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    airlinesList = [];

    for (let i = 0; i < 5; i++) {
      const airline: AirlineEntity = await repository.save({
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        foundationDate: faker.date.past(),
        website: faker.internet.url(),
      });
      airlinesList.push(airline);
    }
  };

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findAll debería retornar todas las aerolíneas', async () => {
    const airlines: AirlineEntity[] = await service.findAll();
    expect(airlines).not.toBeNull();
    expect(airlines).toHaveLength(airlinesList.length);
  });

  it('findOne debería retornar una aerolínea por id', async () => {
    const storedAirline: AirlineEntity = airlinesList[0];
    const airline: AirlineEntity = await service.findOne(storedAirline.id);
    expect(airline).not.toBeNull();
    expect(airline.name).toEqual(storedAirline.name);
    expect(airline.description).toEqual(storedAirline.description);
    expect(airline.foundationDate).toEqual(storedAirline.foundationDate);
    expect(airline.website).toEqual(storedAirline.website);
  });

  it('findOne debería lanzar una excepción para una aerolínea inválida', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'No se encontró la aerolínea con el id proporcionado',
    );
  });

  it('create debería retornar una nueva aerolínea', async () => {
    const pastDate = faker.date.past();
    const airline: AirlineEntity = {
      id: '',
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      foundationDate: pastDate,
      website: faker.internet.url(),
      airports: [],
    };

    const newAirline: AirlineEntity = await service.create(airline);
    expect(newAirline).not.toBeNull();

    const storedAirline: AirlineEntity = await repository.findOne({
      where: { id: newAirline.id },
    });
    expect(storedAirline).not.toBeNull();
    expect(storedAirline.name).toEqual(newAirline.name);
    expect(storedAirline.description).toEqual(newAirline.description);
    expect(storedAirline.foundationDate).toEqual(newAirline.foundationDate);
    expect(storedAirline.website).toEqual(newAirline.website);
  });

  it('create debería lanzar una excepción para una fecha de fundación en el futuro', async () => {
    const futureDate = faker.date.future();
    const airline: AirlineEntity = {
      id: '',
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      foundationDate: futureDate,
      website: faker.internet.url(),
      airports: [],
    };

    await expect(() => service.create(airline)).rejects.toHaveProperty(
      'message',
      'La fecha de fundación debe ser pasada',
    );
  });

  it('update debería modificar una aerolínea', async () => {
    const airline: AirlineEntity = airlinesList[0];
    airline.name = 'Nuevo nombre';
    airline.description = 'Nueva descripción';

    const updatedAirline: AirlineEntity = await service.update(
      airline.id,
      airline,
    );
    expect(updatedAirline).not.toBeNull();

    const storedAirline: AirlineEntity = await repository.findOne({
      where: { id: airline.id },
    });
    expect(storedAirline).not.toBeNull();
    expect(storedAirline.name).toEqual(airline.name);
    expect(storedAirline.description).toEqual(airline.description);
  });

  it('update debería lanzar una excepción para una aerolínea inválida', async () => {
    let airline: AirlineEntity = airlinesList[0];
    airline = {
      ...airline,
      name: 'Nuevo nombre',
      description: 'Nueva descripción',
    };
    await expect(() => service.update('0', airline)).rejects.toHaveProperty(
      'message',
      'No se encontró la aerolínea con el id proporcionado',
    );
  });

  it('update debería lanzar una excepción para una fecha de fundación en el futuro', async () => {
    const airline: AirlineEntity = airlinesList[0];
    airline.foundationDate = faker.date.future();

    await expect(() =>
      service.update(airline.id, airline),
    ).rejects.toHaveProperty(
      'message',
      'La fecha de fundación debe ser pasada',
    );
  });

  it('delete debería eliminar una aerolínea', async () => {
    const airline: AirlineEntity = airlinesList[0];
    await service.delete(airline.id);

    const deletedAirline: AirlineEntity = await repository.findOne({
      where: { id: airline.id },
    });
    expect(deletedAirline).toBeNull();
  });

  it('delete debería lanzar una excepción para una aerolínea inválida', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'No se encontró la aerolínea con el id proporcionado',
    );
  });
});

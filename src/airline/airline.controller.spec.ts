import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AirlineEntity } from './airline.entity/airline.entity';
import { AirlineController } from './airline.controller';
import { AirlineService } from './airline.service';
import { faker } from '@faker-js/faker';

describe('AirlineController', () => {
  let controller: AirlineController;
  let repository: Repository<AirlineEntity>;
  let airlinesList: AirlineEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      controllers: [AirlineController],
      providers: [AirlineService],
    }).compile();

    controller = module.get<AirlineController>(AirlineController);
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
    expect(controller).toBeDefined();
  });

  it('findAll debería retornar todas las aerolíneas', async () => {
    const result = await controller.findAll();
    expect(result).not.toBeNull();
    expect(result.length).toBe(airlinesList.length);
  });

  it('findOne debería retornar una aerolínea por id', async () => {
    const storedAirline: AirlineEntity = airlinesList[0];
    const result = await controller.findOne(storedAirline.id);
    expect(result).not.toBeNull();
    expect(result.id).toBe(storedAirline.id);
    expect(result.name).toBe(storedAirline.name);
  });

  it('create debería retornar una nueva aerolínea', async () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    const airlineDto = {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      foundationDate: pastDate,
      website: faker.internet.url(),
    };

    const result = await controller.create(airlineDto);
    expect(result).not.toBeNull();
    expect(result.name).toBe(airlineDto.name);
    expect(result.description).toBe(airlineDto.description);
  });

  it('update debería modificar una aerolínea', async () => {
    const airline = airlinesList[0];
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    const airlineDto = {
      name: 'Aerolínea actualizada',
      description: 'Descripción actualizada',
      foundationDate: pastDate,
      website: 'https://www.updated-airline.com',
    };

    const result = await controller.update(airline.id, airlineDto);
    expect(result).not.toBeNull();
    expect(result.name).toBe(airlineDto.name);
    expect(result.description).toBe(airlineDto.description);
  });

  it('delete debería eliminar una aerolínea', async () => {
    const airline = airlinesList[0];
    await controller.delete(airline.id);

    const storedAirline = await repository.findOne({
      where: { id: airline.id },
    });
    expect(storedAirline).toBeNull();
  });
});

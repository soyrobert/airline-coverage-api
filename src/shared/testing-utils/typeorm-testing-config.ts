import { TypeOrmModule } from '@nestjs/typeorm';
import { AirlineEntity } from '../../airline/airline.entity/airline.entity';
import { AirportEntity } from '../../airport/airport.entity/airport.entity';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [AirlineEntity, AirportEntity],
    synchronize: true,
  }),
  TypeOrmModule.forFeature([AirlineEntity, AirportEntity]),
];

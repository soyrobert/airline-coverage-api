import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirlineEntity } from '../airline/airline.entity/airline.entity';
import { AirportEntity } from '../airport/airport.entity/airport.entity';
import { AirlineAirportService } from './airline-airport.service';
import { AirlineAirportController } from './airline-airport.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AirlineEntity, AirportEntity])],
  providers: [AirlineAirportService],
  exports: [AirlineAirportService],
  controllers: [AirlineAirportController],
})
export class AirlineAirportModule {}

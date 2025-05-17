import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportEntity } from './airport.entity/airport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AirportEntity])],
})
export class AirportModule {}

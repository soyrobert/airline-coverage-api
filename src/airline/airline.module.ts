import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirlineEntity } from './airline.entity/airline.entity';
import { AirlineService } from './airline.service';
import { AirlineController } from './airline.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AirlineEntity])],
  providers: [AirlineService],
  exports: [AirlineService],
  controllers: [AirlineController],
})
export class AirlineModule {}

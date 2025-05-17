import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AirlineModule } from './airline/airline.module';
import { AirportModule } from './airport/airport.module';
import { AirlineEntity } from './airline/airline.entity/airline.entity';
import { AirportEntity } from './airport/airport.entity/airport.entity';
import { AirlineAirportModule } from './airline-airport/airline-airport.module';

@Module({
  imports: [
    AirlineModule,
    AirportModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'airline',
      entities: [AirlineEntity, AirportEntity],
      dropSchema: true,
      synchronize: true,
    }),
    AirlineAirportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

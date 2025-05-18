import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AirlineEntity } from '../airline/airline.entity/airline.entity';
import { AirportEntity } from '../airport/airport.entity/airport.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class AirlineAirportService {
  constructor(
    @InjectRepository(AirlineEntity)
    private readonly airlineRepository: Repository<AirlineEntity>,

    @InjectRepository(AirportEntity)
    private readonly airportRepository: Repository<AirportEntity>,
  ) {}

  async addAirportToAirline(
    airlineId: string,
    airportId: string,
  ): Promise<AirlineEntity> {
    const airport: AirportEntity = await this.airportRepository.findOne({
      where: { id: airportId },
    });
    if (!airport)
      throw new BusinessLogicException(
        'No se encontró el aeropuerto con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    const airline: AirlineEntity = await this.airlineRepository.findOne({
      where: { id: airlineId },
      relations: ['airports'],
    });
    if (!airline)
      throw new BusinessLogicException(
        'No se encontró la aerolínea con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    airline.airports = [...airline.airports, airport];
    return await this.airlineRepository.save(airline);
  }

  async findAirportsFromAirline(airlineId: string): Promise<AirportEntity[]> {
    const airline: AirlineEntity = await this.airlineRepository.findOne({
      where: { id: airlineId },
      relations: ['airports'],
    });
    if (!airline)
      throw new BusinessLogicException(
        'No se encontró la aerolínea con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    return airline.airports;
  }

  async findAirportFromAirline(
    airlineId: string,
    airportId: string,
  ): Promise<AirportEntity> {
    const airport: AirportEntity = await this.airportRepository.findOne({
      where: { id: airportId },
    });
    if (!airport)
      throw new BusinessLogicException(
        'No se encontró el aeropuerto con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    const airline: AirlineEntity = await this.airlineRepository.findOne({
      where: { id: airlineId },
      relations: ['airports'],
    });
    if (!airline)
      throw new BusinessLogicException(
        'No se encontró la aerolínea con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    const airlineAirport: AirportEntity = airline.airports.find(
      (a) => a.id === airport.id,
    );

    if (!airlineAirport)
      throw new BusinessLogicException(
        'No se encontró el aeropuerto con el id proporcionado en la aerolínea',
        BusinessError.PRECONDITION_FAILED,
      );

    return airlineAirport;
  }

  async updateAirportsFromAirline(
    airlineId: string,
    airports: AirportEntity[],
  ): Promise<AirlineEntity> {
    const airline: AirlineEntity = await this.airlineRepository.findOne({
      where: { id: airlineId },
      relations: ['airports'],
    });
    if (!airline)
      throw new BusinessLogicException(
        'No se encontró la aerolínea con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < airports.length; i++) {
      const airport: AirportEntity = await this.airportRepository.findOne({
        where: { id: airports[i].id },
      });
      if (!airport)
        throw new BusinessLogicException(
          'No se encontró el aeropuerto con el id proporcionado',
          BusinessError.NOT_FOUND,
        );
    }

    airline.airports = airports;
    return await this.airlineRepository.save(airline);
  }

  async deleteAirportFromAirline(airlineId: string, airportId: string) {
    const airport: AirportEntity = await this.airportRepository.findOne({
      where: { id: airportId },
    });
    if (!airport)
      throw new BusinessLogicException(
        'No se encontró el aeropuerto con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    const airline: AirlineEntity = await this.airlineRepository.findOne({
      where: { id: airlineId },
      relations: ['airports'],
    });
    if (!airline)
      throw new BusinessLogicException(
        'No se encontró la aerolínea con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    const airlineAirport: AirportEntity = airline.airports.find(
      (a) => a.id === airport.id,
    );

    if (!airlineAirport)
      throw new BusinessLogicException(
        'No se encontró el aeropuerto con el id proporcionado en la aerolínea',
        BusinessError.PRECONDITION_FAILED,
      );

    airline.airports = airline.airports.filter((a) => a.id !== airportId);
    await this.airlineRepository.save(airline);
  }
}

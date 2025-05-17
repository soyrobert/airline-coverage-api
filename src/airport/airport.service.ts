import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { AirportEntity } from './airport.entity/airport.entity';

@Injectable()
export class AirportService {
  constructor(
    @InjectRepository(AirportEntity)
    private readonly airportRepository: Repository<AirportEntity>,
  ) {}

  async findAll(): Promise<AirportEntity[]> {
    return await this.airportRepository.find({ relations: ['airlines'] });
  }

  async findOne(id: string): Promise<AirportEntity> {
    const airport: AirportEntity = await this.airportRepository.findOne({
      where: { id },
      relations: ['airlines'],
    });
    if (!airport)
      throw new BusinessLogicException(
        'No se encontró el aeropuerto con el id proporcionado',
        BusinessError.NOT_FOUND,
      );
    return airport;
  }

  async create(airport: AirportEntity): Promise<AirportEntity> {
    // Validar código del aeropuerto con 3 caracteres
    if (airport.code.length !== 3) {
      throw new BusinessLogicException(
        'El código del aeropuerto debe tener exactamente 3 caracteres',
        BusinessError.PRECONDITION_FAILED,
      );
    }
    return await this.airportRepository.save(airport);
  }

  async update(id: string, airport: AirportEntity): Promise<AirportEntity> {
    const persistedAirport: AirportEntity =
      await this.airportRepository.findOne({ where: { id } });
    if (!persistedAirport)
      throw new BusinessLogicException(
        'No se encontró el aeropuerto con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    // Validar código del aeropuerto con 3 caracteres
    if (airport.code.length !== 3) {
      throw new BusinessLogicException(
        'El código del aeropuerto debe tener exactamente 3 caracteres',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    return await this.airportRepository.save({
      ...persistedAirport,
      ...airport,
    });
  }

  async delete(id: string) {
    const airport: AirportEntity = await this.airportRepository.findOne({
      where: { id },
    });
    if (!airport)
      throw new BusinessLogicException(
        'No se encontró el aeropuerto con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    await this.airportRepository.remove(airport);
  }
}

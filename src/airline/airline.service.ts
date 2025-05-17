import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { AirlineEntity } from './airline.entity/airline.entity';

@Injectable()
export class AirlineService {
  constructor(
    @InjectRepository(AirlineEntity)
    private readonly airlineRepository: Repository<AirlineEntity>,
  ) {}

  async findAll(): Promise<AirlineEntity[]> {
    return await this.airlineRepository.find({ relations: ['airports'] });
  }

  async findOne(id: string): Promise<AirlineEntity> {
    const airline: AirlineEntity = await this.airlineRepository.findOne({
      where: { id },
      relations: ['airports'],
    });
    if (!airline)
      throw new BusinessLogicException(
        'No se encontró la aerolínea con el id proporcionado',
        BusinessError.NOT_FOUND,
      );
    return airline;
  }

  async create(airline: AirlineEntity): Promise<AirlineEntity> {
    // Validar que la fecha de fundación esté en el pasado
    if (airline.foundationDate > new Date()) {
      throw new BusinessLogicException(
        'La fecha de fundación debe ser pasada',
        BusinessError.PRECONDITION_FAILED,
      );
    }
    return await this.airlineRepository.save(airline);
  }

  async update(id: string, airline: AirlineEntity): Promise<AirlineEntity> {
    const persistedAirline: AirlineEntity =
      await this.airlineRepository.findOne({ where: { id } });
    if (!persistedAirline)
      throw new BusinessLogicException(
        'No se encontró la aerolínea con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    // Fecha de fundación en el pasado
    if (airline.foundationDate > new Date()) {
      throw new BusinessLogicException(
        'La fecha de fundación debe ser pasada',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    return await this.airlineRepository.save({
      ...persistedAirline,
      ...airline,
    });
  }

  async delete(id: string) {
    const airline: AirlineEntity = await this.airlineRepository.findOne({
      where: { id },
    });
    if (!airline)
      throw new BusinessLogicException(
        'No se encontró la aerolínea con el id proporcionado',
        BusinessError.NOT_FOUND,
      );

    await this.airlineRepository.remove(airline);
  }
}

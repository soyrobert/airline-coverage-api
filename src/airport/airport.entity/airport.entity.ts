import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AirlineEntity } from '../../airline/airline.entity/airline.entity';

@Entity()
export class AirportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ length: 3 })
  code: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @ManyToMany(() => AirlineEntity, (airline) => airline.airports)
  @JoinTable()
  airlines: AirlineEntity[];
}

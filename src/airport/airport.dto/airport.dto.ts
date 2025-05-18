import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AirportDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3, {
    message: 'El código del aeropuerto debe tener exactamente 3 caracteres',
  })
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  readonly country: string;

  @IsString()
  @IsNotEmpty()
  readonly city: string;
}

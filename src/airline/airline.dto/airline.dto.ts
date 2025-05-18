import { IsNotEmpty, IsString, IsUrl, IsDate } from 'class-validator';

export class AirlineDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsNotEmpty()
  @IsDate()
  readonly foundationDate: Date;

  @IsUrl()
  @IsNotEmpty()
  readonly website: string;
}

import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AirlineDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsNotEmpty()
  readonly foundationDate: Date;

  @IsUrl()
  @IsNotEmpty()
  readonly website: string;
}

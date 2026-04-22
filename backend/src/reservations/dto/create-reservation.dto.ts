import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @MinLength(1)
  travelId: string;

  @IsInt()
  @Min(1)
  seats: number;
}

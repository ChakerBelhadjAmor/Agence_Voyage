import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(1)
  reservationId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(3)
  comment: string;
}

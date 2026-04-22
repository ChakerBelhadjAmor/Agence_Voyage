import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Min,
} from 'class-validator';

export class CreateTravelDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsString()
  @MinLength(1)
  destination: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

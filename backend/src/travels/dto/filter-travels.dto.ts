import { Transform, Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FilterTravelsDto {
  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsDateString()
  startAfter?: string;

  @IsOptional()
  @IsDateString()
  endBefore?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 12;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeInactive?: boolean = false;
}

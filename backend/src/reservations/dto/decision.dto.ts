import { IsIn } from 'class-validator';

export class DecisionDto {
  @IsIn(['CONFIRMED', 'REJECTED'])
  decision: 'CONFIRMED' | 'REJECTED';
}

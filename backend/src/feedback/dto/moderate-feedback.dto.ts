import { IsIn } from 'class-validator';

export class ModerateFeedbackDto {
  @IsIn(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';
}

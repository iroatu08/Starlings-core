import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'traveler@example.com' })
  @IsEmail()
  email: string;
}

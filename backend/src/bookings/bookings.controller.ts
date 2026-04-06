import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  createFromCart(@GetUser() user: User) {
    return this.bookingsService.createFromCart(user);
  }

  @Get('me')
  getMyBookings(@GetUser() user: User) {
    return this.bookingsService.findMyBookings(user.id);
  }

  @Get(':id')
  getBooking(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }
}

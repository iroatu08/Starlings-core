import { Controller, Get, Post, Param, UseGuards, Body, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RequestRefundDto } from './dto/request-refund.dto';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  createFromCart(@GetUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createFromCart(user, dto);
  }

  @Get('me')
  getMyBookings(@GetUser() user: User) {
    return this.bookingsService.findMyBookings(user.id);
  }

  @Get(':id')
  getBooking(@Param('id') id: string, @GetUser() user: User) {
    return this.bookingsService.findOneForUser(id, user.id, user.role);
  }

  @Post(':id/refund-requests')
  requestRefund(@Param('id') id: string, @GetUser() user: User, @Body() dto: RequestRefundDto) {
    return this.bookingsService.requestRefund(id, user, dto.reason);
  }

  @Get(':id/receipt.pdf')
  async downloadReceiptPdf(@Param('id') id: string, @GetUser() user: User, @Res() res: Response) {
    const { fileName, buffer } = await this.bookingsService.generateReceiptPdf(id, user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.send(buffer);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { UsersService } from '../users/users.service';
import { sanitizeBooking } from '../common/utils/sanitize-user.util';
import { MailService } from '../mail/mail.service';
import { AdminSendEmailDto } from './dto/admin-send-email.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Booking) private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  // get stats for the admin dashboard
  async getStats() {
    const totalBookings = await this.bookingRepo.count();
    const totalUsers = await this.usersService.countUsers();
    const succeeded = await this.paymentRepo.find({ where: { status: PaymentStatus.SUCCEEDED } });
    const revenueNgn = succeeded.reduce((sum, p) => sum + Number(p.amountNgn), 0);
    const recentBookings = await this.bookingRepo.find({
      relations: ['user', 'payment'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
    return {
      totalBookings,
      totalUsers,
      revenueNgn,
      recentBookings: recentBookings.map((b) => sanitizeBooking(b)),
    };
  }

  // send an email to all verified users or a specific user
  async sendEmail(dto: AdminSendEmailDto) {
    if (dto.broadcastToAll) {
      const emails = await this.usersService.getVerifiedUserEmails();
      for (const email of emails) {
        await this.mailService.sendHtmlEmail(email, dto.subject, dto.htmlBody);
      }
      return { message: `Sent to ${emails.length} verified users.` };
    }
    let to: string | null = dto.toEmail || null;
    if (!to && dto.userId) {
      to = await this.usersService.findEmailById(dto.userId);
    }
    if (!to) throw new BadRequestException('Provide toEmail, userId, or broadcastToAll');
    await this.mailService.sendHtmlEmail(to, dto.subject, dto.htmlBody);
    return { message: 'Email sent successfully.' };
  }
}

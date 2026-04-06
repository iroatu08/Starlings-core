import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentsService } from '../payments/payments.service';
import { DestinationsService } from '../destinations/destinations.service';
import { PackagesService } from '../packages/packages.service';
import { GalleryService } from '../gallery/gallery.service';
import { ContactService } from '../contact/contact.service';
import { CreateDestinationDto } from '../destinations/dto/create-destination.dto';
import { UpdateDestinationDto } from '../destinations/dto/update-destination.dto';
import { CreatePackageDto } from '../packages/dto/create-package.dto';
import { UpdatePackageDto } from '../packages/dto/update-package.dto';
import { UploadImageDto } from '../gallery/dto/upload-image.dto';
import { BookingStatus } from '../bookings/entities/booking.entity';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private usersService: UsersService,
    private bookingsService: BookingsService,
    private paymentsService: PaymentsService,
    private destinationsService: DestinationsService,
    private packagesService: PackagesService,
    private galleryService: GalleryService,
    private contactService: ContactService,
  ) {}

  // ─── USERS ─────────────────────────────────────────────
  @Get('users')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  getUsers(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.usersService.findAll(page, limit, search);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUserAdmin(id, body);
  }

  // ─── BOOKINGS ────────────────────────────────────────────
  @Get('bookings')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'status', required: false })
  getBookings(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: BookingStatus) {
    return this.bookingsService.findAll(page, limit, status);
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(@Param('id') id: string, @Body('status') status: BookingStatus, @GetUser() user: User) {
    return this.bookingsService.updateStatus(id, status, user);
  }

  // ─── PAYMENTS ────────────────────────────────────────────
  @Get('payments')
  getPayments(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentsService.getAllPayments(page, limit);
  }

  // ─── DESTINATIONS ────────────────────────────────────────
  @Post('destinations')
  createDestination(@Body() dto: CreateDestinationDto) {
    return this.destinationsService.create(dto);
  }

  @Patch('destinations/:id')
  updateDestination(@Param('id') id: string, @Body() dto: UpdateDestinationDto) {
    return this.destinationsService.update(id, dto);
  }

  @Delete('destinations/:id')
  deleteDestination(@Param('id') id: string) {
    return this.destinationsService.remove(id);
  }

  // ─── PACKAGES ────────────────────────────────────────────
  @Post('packages')
  createPackage(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto);
  }

  @Patch('packages/:id')
  updatePackage(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packagesService.update(id, dto);
  }

  @Delete('packages/:id')
  deletePackage(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }

  // ─── GALLERY ─────────────────────────────────────────────
  @Post('gallery/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadImageDto) {
    return this.galleryService.uploadImage(file, dto);
  }

  @Delete('gallery/:id')
  deleteImage(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }

  // ─── CONTACT ─────────────────────────────────────────────
  @Get('contact')
  getContactSubmissions(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.contactService.findAll(page, limit);
  }

  @Patch('contact/:id/read')
  markContactRead(@Param('id') id: string) {
    return this.contactService.markRead(id);
  }
}

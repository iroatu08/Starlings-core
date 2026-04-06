import {
  Controller, Post, Get, Param, Body, UseGuards, Headers, RawBodyRequest, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  initialize(@GetUser() user: User, @Body() dto: InitializePaymentDto) {
    return this.paymentsService.initialize(user, dto);
  }

  @Get('verify/:reference')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  verify(@Param('reference') reference: string, @GetUser() user: User) {
    return this.paymentsService.verify(reference, user);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getHistory(@GetUser() user: User) {
    return this.paymentsService.getHistory(user.id);
  }
}

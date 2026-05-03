import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('reviews')
@Controller('destinations/:destinationId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List reviews for a destination' })
  findByDestination(@Param('destinationId') destinationId: string) {
    return this.reviewsService.findByDestination(destinationId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review (one per user per destination)' })
  create(
    @Param('destinationId') destinationId: string,
    @GetUser() user: User,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(destinationId, user, dto);
  }
}

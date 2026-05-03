import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DestinationReview } from './entities/destination-review.entity';
import { Destination } from '../destinations/entities/destination.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';

export interface ReviewListItem {
  id: string;
  destinationId: string;
  userId: string | null;
  authorName: string;
  rating: number;
  body: string;
  createdAt: Date;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(DestinationReview)
    private readonly reviewRepo: Repository<DestinationReview>,
    @InjectRepository(Destination)
    private readonly destRepo: Repository<Destination>,
  ) {}

  private formatAuthor(user: User): string {
    const initial = user.lastName?.trim()?.charAt(0);
    return initial ? `${user.firstName} ${initial}.` : user.firstName;
  }

  async findByDestination(destinationId: string): Promise<{
    reviews: ReviewListItem[];
    averageRating: number;
    count: number;
  }> {
    const dest = await this.destRepo.findOne({ where: { id: destinationId } });
    if (!dest) throw new NotFoundException('Destination not found');

    const reviews = await this.reviewRepo.find({
      where: { destinationId },
      order: { createdAt: 'DESC' },
    });

    const count = reviews.length;
    const averageRating =
      count === 0 ? 0 : Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10;

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        destinationId: r.destinationId,
        userId: r.userId,
        authorName: r.authorName,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt,
      })),
      averageRating,
      count,
    };
  }

  async create(destinationId: string, user: User, dto: CreateReviewDto): Promise<ReviewListItem> {
    const dest = await this.destRepo.findOne({ where: { id: destinationId } });
    if (!dest) throw new NotFoundException('Destination not found');

    const existing = await this.reviewRepo.findOne({
      where: { destinationId, userId: user.id },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this destination');
    }

    const authorName = this.formatAuthor(user);
    const row = this.reviewRepo.create({
      destinationId,
      userId: user.id,
      authorName,
      rating: dto.rating,
      body: dto.body.trim(),
    });
    const saved = await this.reviewRepo.save(row);
    return {
      id: saved.id,
      destinationId: saved.destinationId,
      userId: saved.userId,
      authorName: saved.authorName,
      rating: saved.rating,
      body: saved.body,
      createdAt: saved.createdAt,
    };
  }
}

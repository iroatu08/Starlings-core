import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly repo: Repository<NewsletterSubscriber>,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const existing = await this.repo.findOne({ where: { email: dto.email.toLowerCase().trim() } });
    if (existing) {
      return { message: 'You are already subscribed.' };
    }
    const row = this.repo.create({ email: dto.email.toLowerCase().trim() });
    await this.repo.save(row);
    return { message: 'Thanks for subscribing!' };
  }
}

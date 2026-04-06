import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission } from './entities/contact-submission.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactSubmission) private repo: Repository<ContactSubmission>,
    private mailService: MailService,
  ) {}

  async submit(dto: CreateContactDto) {
    const submission = this.repo.create(dto);
    await this.repo.save(submission);

    await this.mailService.sendContactAutoReply(submission);
    await this.mailService.sendAdminAlert('New Contact Submission', {
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
    });

    return { message: 'Thank you for your message. We will be in touch shortly.' };
  }

  findAll(page = 1, limit = 20) {
    return this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    }).then(([submissions, total]) => ({ submissions, total, page, limit }));
  }

  async markRead(id: string) {
    await this.repo.update(id, { isRead: true });
    return { message: 'Marked as read' };
  }
}

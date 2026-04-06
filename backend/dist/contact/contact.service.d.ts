import { Repository } from 'typeorm';
import { ContactSubmission } from './entities/contact-submission.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { MailService } from '../mail/mail.service';
export declare class ContactService {
    private repo;
    private mailService;
    constructor(repo: Repository<ContactSubmission>, mailService: MailService);
    submit(dto: CreateContactDto): Promise<{
        message: string;
    }>;
    findAll(page?: number, limit?: number): Promise<{
        submissions: ContactSubmission[];
        total: number;
        page: number;
        limit: number;
    }>;
    markRead(id: string): Promise<{
        message: string;
    }>;
}

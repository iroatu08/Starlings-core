"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contact_submission_entity_1 = require("./entities/contact-submission.entity");
const mail_service_1 = require("../mail/mail.service");
let ContactService = class ContactService {
    constructor(repo, mailService) {
        this.repo = repo;
        this.mailService = mailService;
    }
    async submit(dto) {
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
    async markRead(id) {
        await this.repo.update(id, { isRead: true });
        return { message: 'Marked as read' };
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_submission_entity_1.ContactSubmission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], ContactService);
//# sourceMappingURL=contact.service.js.map
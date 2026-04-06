import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { User } from '../users/entities/user.entity';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    initialize(user: User, dto: InitializePaymentDto): Promise<{
        authorization_url: any;
        access_code: any;
        reference: string;
    }>;
    verify(reference: string, user: User): Promise<{
        status: string;
        amount: number;
        reference: string;
        bookingId: string;
    }>;
    handleWebhook(payload: any, signature: string): Promise<{
        received: boolean;
    }>;
    getHistory(user: User): Promise<import("./entities/payment.entity").Payment[]>;
}

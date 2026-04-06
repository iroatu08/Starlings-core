import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private userRepo;
    constructor(configService: ConfigService, userRepo: Repository<User>);
    validate(req: Request, payload: {
        sub: string;
    }): Promise<User>;
}
export {};

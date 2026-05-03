import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BookingItem } from './booking-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { BookingTraveler } from './booking-traveler.entity';
import { RefundRequest } from '../../payments/entities/refund-request.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reference_number', unique: true })
  referenceNumber: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ name: 'total_amount_ngn', type: 'decimal', precision: 12, scale: 2 })
  totalAmountNgn: number;

  @OneToMany(() => BookingItem, (item) => item.booking, { cascade: true, eager: true })
  items: BookingItem[];

  @OneToMany(() => BookingTraveler, (traveler) => traveler.booking, { cascade: true, eager: true })
  travelers: BookingTraveler[];

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;

  @OneToMany(() => RefundRequest, (request) => request.booking)
  refundRequests: RefundRequest[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

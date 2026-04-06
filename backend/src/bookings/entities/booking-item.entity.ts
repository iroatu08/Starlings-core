import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Package } from '../../packages/entities/package.entity';

@Entity('booking_items')
export class BookingItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'package_id' })
  packageId: string;

  @ManyToOne(() => Package, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'package_id' })
  package: Package;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'unit_price_ngn', type: 'decimal', precision: 12, scale: 2 })
  unitPriceNgn: number;
}

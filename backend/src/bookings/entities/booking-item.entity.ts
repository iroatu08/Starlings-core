import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Package } from '../../packages/entities/package.entity';
import { Destination } from '../../destinations/entities/destination.entity';
import { BundlePackageSnapshot } from '../../cart/entities/cart-item.entity';

export interface BookingBundleSnapshot {
  packagesSnapshot: BundlePackageSnapshot[];
  keptPackageIds: string[];
  removedPackageIds: string[];
  originalTotalNgn: number;
  originalTotalUsd: number;
  customizedTotalNgn: number;
  customizedTotalUsd: number;
  savingsNgn: number;
  savingsUsd: number;
}

@Entity('booking_items')
export class BookingItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'package_id', nullable: true })
  packageId: string | null;

  @ManyToOne(() => Package, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'package_id' })
  package: Package | null;

  @Column({ name: 'destination_id', nullable: true })
  destinationId: string | null;

  @ManyToOne(() => Destination, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination | null;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'unit_price_ngn', type: 'decimal', precision: 12, scale: 2 })
  unitPriceNgn: number;

  @Column({ name: 'bundle_snapshot', type: 'jsonb', nullable: true })
  bundleSnapshot: BookingBundleSnapshot | null;

  @Column({ name: 'original_total_ngn', type: 'decimal', precision: 12, scale: 2, default: 0 })
  originalTotalNgn: number;

  @Column({ name: 'customized_total_ngn', type: 'decimal', precision: 12, scale: 2, default: 0 })
  customizedTotalNgn: number;

  @Column({ name: 'savings_ngn', type: 'decimal', precision: 12, scale: 2, default: 0 })
  savingsNgn: number;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Destination } from '../../destinations/entities/destination.entity';

export enum PackageType {
  VISA_PROCESSING = 'visa_processing',
  HOTEL_RESERVATION = 'hotel_reservation',
  FREE_TAXI = 'free_taxi',
  AIRPORT_TRANSFER = 'airport_transfer',
  CUSTOM = 'custom',
}

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'destination_id' })
  destinationId: string;

  @ManyToOne(() => Destination, (dest) => dest.packages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;

  @Column()
  title: string;

  @Column({
    name: 'package_type',
    type: 'enum',
    enum: PackageType,
    default: PackageType.CUSTOM,
  })
  packageType: PackageType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_removable', default: true })
  isRemovable: boolean;

  @Column({ name: 'includes_visa', default: false })
  includesVisa: boolean;

  @Column({ name: 'includes_flight', default: false })
  includesFlight: boolean;

  @Column({ name: 'includes_hotel', default: false })
  includesHotel: boolean;

  @Column({ name: 'includes_activities', default: false })
  includesActivities: boolean;

  @Column({ name: 'price_ngn', type: 'decimal', precision: 12, scale: 2 })
  priceNgn: number;

  @Column({ name: 'price_usd', type: 'decimal', precision: 10, scale: 2 })
  priceUsd: number;

  @Column({ name: 'duration_days', default: 1 })
  durationDays: number;

  @Column({ name: 'max_capacity', default: 20 })
  maxCapacity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Package } from '../../packages/entities/package.entity';
import { Destination } from '../../destinations/entities/destination.entity';

export interface BundlePackageSnapshot {
  id: string;
  name: string;
  type: string;
  description: string | null;
  priceNgn: number;
  priceUsd: number;
  isRemovable: boolean;
}

export interface CartBundleSnapshot {
  packagesSnapshot: BundlePackageSnapshot[];
  keptPackageIds: string[];
  removedPackageIds: string[];
  originalTotalNgn: number;
  originalTotalUsd: number;
  customizedTotalNgn: number;
  customizedTotalUsd: number;
}

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cart_id' })
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

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
  bundleSnapshot: CartBundleSnapshot | null;
}

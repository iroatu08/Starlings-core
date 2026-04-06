import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Package } from '../../packages/entities/package.entity';
import { GalleryImage } from '../../gallery/entities/gallery.entity';

@Entity('destinations')
export class Destination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'hero_image_url', nullable: true })
  heroImageUrl: string;

  @Column({ name: 'price_from_ngn', type: 'decimal', precision: 12, scale: 2, default: 0 })
  priceFromNgn: number;

  @Column({ name: 'price_from_usd', type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceFromUsd: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @OneToMany(() => Package, (pkg) => pkg.destination)
  packages: Package[];

  @OneToMany(() => GalleryImage, (img) => img.destination)
  galleryImages: GalleryImage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

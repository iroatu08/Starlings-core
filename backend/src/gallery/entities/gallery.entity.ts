import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Destination } from '../../destinations/entities/destination.entity';

@Entity('gallery')
export class GalleryImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'destination_id', nullable: true })
  destinationId: string;

  @ManyToOne(() => Destination, (dest) => dest.galleryImages, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;

  @Column({ name: 'cloudinary_public_id' })
  cloudinaryPublicId: string;

  @Column()
  url: string;

  @Column({ name: 'alt_text', nullable: true })
  altText: string;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

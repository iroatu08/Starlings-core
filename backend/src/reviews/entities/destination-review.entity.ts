import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Destination } from '../../destinations/entities/destination.entity';
import { User } from '../../users/entities/user.entity';

@Entity('destination_reviews')
@Index(['destinationId'])
export class DestinationReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'destination_id' })
  destinationId: string;

  @ManyToOne(() => Destination, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'author_name' })
  authorName: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

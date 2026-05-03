import { MigrationInterface, QueryRunner } from 'typeorm';

export class TravelersRefunds1717000000000 implements MigrationInterface {
  name = 'TravelersRefunds1717000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = 'payments_status_enum'
            AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "public"."payments_status_enum" AS ENUM(
            'pending',
            'refund_pending',
            'refunded',
            'succeeded',
            'failed'
          );
        ELSE
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'refund_pending'
              AND enumtypid = 'public.payments_status_enum'::regtype
          ) THEN
            ALTER TYPE "public"."payments_status_enum" ADD VALUE 'refund_pending';
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'refunded'
              AND enumtypid = 'public.payments_status_enum'::regtype
          ) THEN
            ALTER TYPE "public"."payments_status_enum" ADD VALUE 'refunded';
          END IF;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = 'refund_requests_status_enum'
            AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "public"."refund_requests_status_enum" AS ENUM(
            'pending',
            'approved',
            'rejected',
            'completed',
            'failed'
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booking_travelers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "booking_id" uuid NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "email" character varying,
        "phone" character varying,
        "is_primary" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booking_travelers_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refund_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "booking_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "status" "public"."refund_requests_status_enum" NOT NULL DEFAULT 'pending',
        "reason" text NOT NULL,
        "requested_amount_ngn" numeric(12,2) NOT NULL,
        "admin_id" uuid,
        "resolved_at" TIMESTAMP,
        "paystack_refund_reference" character varying,
        "failure_reason" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refund_requests_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_booking_travelers_booking_email"
      ON "booking_travelers" ("booking_id", "email")
      WHERE "email" IS NOT NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_booking_travelers_booking_id'
        ) THEN
          ALTER TABLE "booking_travelers"
          ADD CONSTRAINT "FK_booking_travelers_booking_id"
          FOREIGN KEY ("booking_id")
          REFERENCES "bookings"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_refund_requests_booking_id'
        ) THEN
          ALTER TABLE "refund_requests"
          ADD CONSTRAINT "FK_refund_requests_booking_id"
          FOREIGN KEY ("booking_id")
          REFERENCES "bookings"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_refund_requests_user_id'
        ) THEN
          ALTER TABLE "refund_requests"
          ADD CONSTRAINT "FK_refund_requests_user_id"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE NO ACTION
          ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refund_requests" DROP CONSTRAINT IF EXISTS "FK_refund_requests_user_id"`);
    await queryRunner.query(`ALTER TABLE "refund_requests" DROP CONSTRAINT IF EXISTS "FK_refund_requests_booking_id"`);
    await queryRunner.query(`ALTER TABLE "booking_travelers" DROP CONSTRAINT IF EXISTS "FK_booking_travelers_booking_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_booking_travelers_booking_email"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refund_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_travelers"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."refund_requests_status_enum"`);
  }
}

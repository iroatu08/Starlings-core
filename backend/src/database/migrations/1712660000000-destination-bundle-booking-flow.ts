import { MigrationInterface, QueryRunner } from 'typeorm';

export class DestinationBundleBookingFlow1712660000000 implements MigrationInterface {
  name = 'DestinationBundleBookingFlow1712660000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = 'packages_package_type_enum'
            AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "public"."packages_package_type_enum" AS ENUM(
            'visa_processing',
            'hotel_reservation',
            'free_taxi',
            'airport_transfer',
            'custom'
          );
        END IF;
      END
      $$;
    `);
    await queryRunner.query(`ALTER TABLE "destinations" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "package_type" "public"."packages_package_type_enum" NOT NULL DEFAULT 'custom'`);
    await queryRunner.query(`ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "is_removable" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "packages" ALTER COLUMN "duration_days" SET DEFAULT 1`);
    await queryRunner.query(`ALTER TABLE "cart_items" ALTER COLUMN "package_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "destination_id" uuid`);
    await queryRunner.query(`ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "bundle_snapshot" jsonb`);
    await queryRunner.query(`ALTER TABLE "booking_items" ALTER COLUMN "package_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "booking_items" ADD COLUMN IF NOT EXISTS "destination_id" uuid`);
    await queryRunner.query(`ALTER TABLE "booking_items" ADD COLUMN IF NOT EXISTS "bundle_snapshot" jsonb`);
    await queryRunner.query(`ALTER TABLE "booking_items" ADD COLUMN IF NOT EXISTS "original_total_ngn" numeric(12,2) NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "booking_items" ADD COLUMN IF NOT EXISTS "customized_total_ngn" numeric(12,2) NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "booking_items" ADD COLUMN IF NOT EXISTS "savings_ngn" numeric(12,2) NOT NULL DEFAULT '0'`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_cart_items_destination_id'
        ) THEN
          ALTER TABLE "cart_items"
          ADD CONSTRAINT "FK_cart_items_destination_id"
          FOREIGN KEY ("destination_id")
          REFERENCES "destinations"("id")
          ON DELETE SET NULL
          ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_booking_items_destination_id'
        ) THEN
          ALTER TABLE "booking_items"
          ADD CONSTRAINT "FK_booking_items_destination_id"
          FOREIGN KEY ("destination_id")
          REFERENCES "destinations"("id")
          ON DELETE SET NULL
          ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "booking_items" DROP CONSTRAINT "FK_booking_items_destination_id"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_destination_id"`);
    await queryRunner.query(`ALTER TABLE "booking_items" DROP COLUMN "savings_ngn"`);
    await queryRunner.query(`ALTER TABLE "booking_items" DROP COLUMN "customized_total_ngn"`);
    await queryRunner.query(`ALTER TABLE "booking_items" DROP COLUMN "original_total_ngn"`);
    await queryRunner.query(`ALTER TABLE "booking_items" DROP COLUMN "bundle_snapshot"`);
    await queryRunner.query(`ALTER TABLE "booking_items" DROP COLUMN "destination_id"`);
    await queryRunner.query(`ALTER TABLE "booking_items" ALTER COLUMN "package_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "bundle_snapshot"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "destination_id"`);
    await queryRunner.query(`ALTER TABLE "cart_items" ALTER COLUMN "package_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "packages" ALTER COLUMN "duration_days" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "is_removable"`);
    await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "package_type"`);
    await queryRunner.query(`ALTER TABLE "destinations" DROP COLUMN "is_active"`);
    await queryRunner.query(`DROP TYPE "public"."packages_package_type_enum"`);
  }
}

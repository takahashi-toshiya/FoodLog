-- CreateEnum
CREATE TYPE "meal_type" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "calorie_source" AS ENUM ('calculated', 'manual');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "apple_user_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serving_amount" DECIMAL(10,2) NOT NULL,
    "serving_unit" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DECIMAL(10,2) NOT NULL,
    "fat" DECIMAL(10,2) NOT NULL,
    "carbs" DECIMAL(10,2) NOT NULL,
    "memo" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "food_id" UUID,
    "recorded_date" DATE NOT NULL,
    "meal_type" "meal_type" NOT NULL,
    "name" TEXT NOT NULL,
    "serving_multiplier" DECIMAL(8,4) NOT NULL,
    "calories" INTEGER NOT NULL,
    "calorie_source" "calorie_source" NOT NULL,
    "protein" DECIMAL(10,2) NOT NULL,
    "fat" DECIMAL(10,2) NOT NULL,
    "carbs" DECIMAL(10,2) NOT NULL,
    "memo" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "effective_from" DATE NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DECIMAL(10,2) NOT NULL,
    "fat" DECIMAL(10,2) NOT NULL,
    "carbs" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "nutrition_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_sets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "food_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_set_items" (
    "id" UUID NOT NULL,
    "food_set_id" UUID NOT NULL,
    "food_id" UUID NOT NULL,
    "serving_multiplier" DECIMAL(8,4) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "food_set_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recorded_date" DATE NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_catalog_items" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serving_amount" DECIMAL(10,2) NOT NULL,
    "serving_unit" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DECIMAL(10,2) NOT NULL,
    "fat" DECIMAL(10,2) NOT NULL,
    "carbs" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "food_catalog_items_pkey" PRIMARY KEY ("id")
);

-- AddCheckConstraint
ALTER TABLE "foods"
    ADD CONSTRAINT "foods_serving_amount_check" CHECK ("serving_amount" > 0),
    ADD CONSTRAINT "foods_calories_check" CHECK ("calories" >= 0),
    ADD CONSTRAINT "foods_protein_check" CHECK ("protein" >= 0),
    ADD CONSTRAINT "foods_fat_check" CHECK ("fat" >= 0),
    ADD CONSTRAINT "foods_carbs_check" CHECK ("carbs" >= 0);

-- AddCheckConstraint
ALTER TABLE "meal_entries"
    ADD CONSTRAINT "meal_entries_serving_multiplier_check" CHECK ("serving_multiplier" > 0),
    ADD CONSTRAINT "meal_entries_calories_check" CHECK ("calories" >= 0),
    ADD CONSTRAINT "meal_entries_protein_check" CHECK ("protein" >= 0),
    ADD CONSTRAINT "meal_entries_fat_check" CHECK ("fat" >= 0),
    ADD CONSTRAINT "meal_entries_carbs_check" CHECK ("carbs" >= 0);

-- AddCheckConstraint
ALTER TABLE "nutrition_goals"
    ADD CONSTRAINT "nutrition_goals_calories_check" CHECK ("calories" > 0),
    ADD CONSTRAINT "nutrition_goals_protein_check" CHECK ("protein" >= 0),
    ADD CONSTRAINT "nutrition_goals_fat_check" CHECK ("fat" >= 0),
    ADD CONSTRAINT "nutrition_goals_carbs_check" CHECK ("carbs" >= 0);

-- AddCheckConstraint
ALTER TABLE "food_set_items"
    ADD CONSTRAINT "food_set_items_serving_multiplier_check" CHECK ("serving_multiplier" > 0),
    ADD CONSTRAINT "food_set_items_sort_order_check" CHECK ("sort_order" >= 0);

-- AddCheckConstraint
ALTER TABLE "weight_records"
    ADD CONSTRAINT "weight_records_weight_kg_check" CHECK ("weight_kg" > 0);

-- AddCheckConstraint
ALTER TABLE "food_catalog_items"
    ADD CONSTRAINT "food_catalog_items_serving_amount_check" CHECK ("serving_amount" > 0),
    ADD CONSTRAINT "food_catalog_items_calories_check" CHECK ("calories" >= 0),
    ADD CONSTRAINT "food_catalog_items_protein_check" CHECK ("protein" >= 0),
    ADD CONSTRAINT "food_catalog_items_fat_check" CHECK ("fat" >= 0),
    ADD CONSTRAINT "food_catalog_items_carbs_check" CHECK ("carbs" >= 0);

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_user_id_key" ON "users"("apple_user_id");

-- CreateIndex
CREATE INDEX "foods_user_id_idx" ON "foods"("user_id");

-- CreateIndex
CREATE INDEX "meal_entries_user_id_recorded_date_idx" ON "meal_entries"("user_id", "recorded_date");

-- CreateIndex
CREATE INDEX "meal_entries_food_id_idx" ON "meal_entries"("food_id");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_goals_user_id_effective_from_key" ON "nutrition_goals"("user_id", "effective_from");

-- CreateIndex
CREATE INDEX "food_sets_user_id_idx" ON "food_sets"("user_id");

-- CreateIndex
CREATE INDEX "food_set_items_food_id_idx" ON "food_set_items"("food_id");

-- CreateIndex
CREATE UNIQUE INDEX "food_set_items_food_set_id_food_id_key" ON "food_set_items"("food_set_id", "food_id");

-- CreateIndex
CREATE UNIQUE INDEX "weight_records_user_id_recorded_date_key" ON "weight_records"("user_id", "recorded_date");

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_goals" ADD CONSTRAINT "nutrition_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_sets" ADD CONSTRAINT "food_sets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_set_items" ADD CONSTRAINT "food_set_items_food_set_id_fkey" FOREIGN KEY ("food_set_id") REFERENCES "food_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_set_items" ADD CONSTRAINT "food_set_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

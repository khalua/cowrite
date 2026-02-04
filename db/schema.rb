# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_02_04_032048) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "circle_members", force: :cascade do |t|
    t.bigint "circle_id", null: false
    t.bigint "user_id", null: false
    t.string "role", default: "member", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["circle_id", "user_id"], name: "index_circle_members_on_circle_id_and_user_id", unique: true
    t.index ["circle_id"], name: "index_circle_members_on_circle_id"
    t.index ["user_id"], name: "index_circle_members_on_user_id"
  end

  create_table "circles", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.bigint "created_by_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_circles_on_created_by_id"
  end

  create_table "contributions", force: :cascade do |t|
    t.bigint "story_id", null: false
    t.bigint "user_id", null: false
    t.text "content"
    t.integer "word_count"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "written_by_id"
    t.datetime "written_at"
    t.index ["story_id"], name: "index_contributions_on_story_id"
    t.index ["user_id"], name: "index_contributions_on_user_id"
    t.index ["written_by_id"], name: "index_contributions_on_written_by_id"
  end

  create_table "invitations", force: :cascade do |t|
    t.bigint "circle_id", null: false
    t.string "email"
    t.string "token"
    t.string "status", default: "pending", null: false
    t.bigint "invited_by_id", null: false
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["circle_id"], name: "index_invitations_on_circle_id"
    t.index ["invited_by_id"], name: "index_invitations_on_invited_by_id"
    t.index ["token"], name: "index_invitations_on_token", unique: true
  end

  create_table "stories", force: :cascade do |t|
    t.string "title"
    t.text "prompt"
    t.bigint "circle_id", null: false
    t.bigint "started_by_id", null: false
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["circle_id"], name: "index_stories_on_circle_id"
    t.index ["started_by_id"], name: "index_stories_on_started_by_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "name"
    t.boolean "is_super_admin", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "circle_members", "circles"
  add_foreign_key "circle_members", "users"
  add_foreign_key "circles", "users", column: "created_by_id"
  add_foreign_key "contributions", "stories"
  add_foreign_key "contributions", "users"
  add_foreign_key "contributions", "users", column: "written_by_id"
  add_foreign_key "invitations", "circles"
  add_foreign_key "invitations", "users", column: "invited_by_id"
  add_foreign_key "stories", "circles"
  add_foreign_key "stories", "users", column: "started_by_id"
end

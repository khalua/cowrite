class CreateCircleMembers < ActiveRecord::Migration[7.2]
  def change
    create_table :circle_members do |t|
      t.references :circle, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :role, default: 'member', null: false

      t.timestamps
    end
    add_index :circle_members, [:circle_id, :user_id], unique: true
  end
end

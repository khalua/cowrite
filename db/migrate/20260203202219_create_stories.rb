class CreateStories < ActiveRecord::Migration[7.2]
  def change
    create_table :stories do |t|
      t.string :title
      t.text :prompt
      t.references :circle, null: false, foreign_key: true
      t.references :started_by, null: false, foreign_key: { to_table: :users }
      t.string :status, default: 'active', null: false

      t.timestamps
    end
  end
end

class CreateContributions < ActiveRecord::Migration[7.2]
  def change
    create_table :contributions do |t|
      t.references :story, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :content
      t.integer :word_count
      t.integer :position

      t.timestamps
    end
  end
end

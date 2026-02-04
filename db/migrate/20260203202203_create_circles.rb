class CreateCircles < ActiveRecord::Migration[7.2]
  def change
    create_table :circles do |t|
      t.string :name
      t.text :description
      t.references :created_by, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end

class CreateInvitations < ActiveRecord::Migration[7.2]
  def change
    create_table :invitations do |t|
      t.references :circle, null: false, foreign_key: true
      t.string :email
      t.string :token
      t.string :status, default: 'pending', null: false
      t.references :invited_by, null: false, foreign_key: { to_table: :users }
      t.datetime :expires_at

      t.timestamps
    end
    add_index :invitations, :token, unique: true
  end
end

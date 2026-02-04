class AddImpersonationFieldsToContributions < ActiveRecord::Migration[7.2]
  def change
    # The user who actually wrote the content (for impersonation, this is the impersonated user)
    # If null, the contribution was written by the user_id directly (no impersonation)
    add_reference :contributions, :written_by, foreign_key: { to_table: :users }, null: true

    # Custom timestamp for when the contribution was "written" (for backdating)
    # If null, use created_at
    add_column :contributions, :written_at, :datetime, null: true
  end
end

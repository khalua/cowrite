class CircleMember < ApplicationRecord
  belongs_to :circle
  belongs_to :user

  validates :role, presence: true, inclusion: { in: %w[admin member] }
  validates :user_id, uniqueness: { scope: :circle_id, message: "is already a member of this circle" }

  scope :admins, -> { where(role: "admin") }
  scope :members, -> { where(role: "member") }
end

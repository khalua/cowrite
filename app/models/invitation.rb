class Invitation < ApplicationRecord
  belongs_to :circle
  belongs_to :inviter, class_name: "User", foreign_key: :invited_by_id

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :status, presence: true, inclusion: { in: %w[pending accepted expired] }
  validates :token, presence: true, uniqueness: true

  before_validation :generate_token, on: :create
  before_validation :set_expiration, on: :create

  scope :pending, -> { where(status: "pending") }
  scope :not_expired, -> { where("expires_at > ?", Time.current) }

  def expired?
    expires_at < Time.current
  end

  def accept!(user)
    return false if expired? || status != "pending"

    transaction do
      update!(status: "accepted")
      circle.circle_members.create!(user: user, role: "member")
    end
    true
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(32)
  end

  def set_expiration
    self.expires_at ||= 7.days.from_now
  end
end

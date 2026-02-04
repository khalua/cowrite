class User < ApplicationRecord
  has_secure_password

  has_many :circle_members, dependent: :destroy
  has_many :circles, through: :circle_members
  has_many :created_circles, class_name: "Circle", foreign_key: :created_by_id, dependent: :nullify
  has_many :started_stories, class_name: "Story", foreign_key: :started_by_id, dependent: :nullify
  has_many :contributions, dependent: :destroy
  has_many :sent_invitations, class_name: "Invitation", foreign_key: :invited_by_id, dependent: :destroy

  validates :email, presence: true, uniqueness: { case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }

  before_save :downcase_email

  def member_of?(circle)
    circles.include?(circle)
  end

  def admin_of?(circle)
    circle_members.find_by(circle: circle)&.role == "admin"
  end

  private

  def downcase_email
    self.email = email.downcase
  end
end

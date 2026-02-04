class Circle < ApplicationRecord
  belongs_to :creator, class_name: "User", foreign_key: :created_by_id
  has_many :circle_members, dependent: :destroy
  has_many :members, through: :circle_members, source: :user
  has_many :stories, dependent: :destroy
  has_many :invitations, dependent: :destroy

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :description, length: { maximum: 500 }, allow_blank: true

  after_create :add_creator_as_admin

  def stories_count
    stories.count
  end

  private

  def add_creator_as_admin
    circle_members.create!(user: creator, role: "admin")
  end
end

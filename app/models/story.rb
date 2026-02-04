class Story < ApplicationRecord
  belongs_to :circle
  belongs_to :starter, class_name: "User", foreign_key: :started_by_id
  has_many :contributions, -> { order(position: :asc) }, dependent: :destroy

  validates :title, presence: true, length: { minimum: 2, maximum: 200 }
  validates :status, presence: true, inclusion: { in: %w[active completed] }

  def word_count
    contributions.sum(:word_count)
  end

  def contributions_count
    contributions.count
  end

  def full_text
    contributions.pluck(:content).join(" ")
  end

  def complete!
    update!(status: "completed")
  end
end

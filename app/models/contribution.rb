class Contribution < ApplicationRecord
  belongs_to :story
  belongs_to :user  # The attributed author (who the contribution appears to be from)
  belongs_to :written_by_user, class_name: "User", foreign_key: :written_by_id, optional: true  # The actual writer (super admin when impersonating)

  validates :content, presence: true, length: { minimum: 1, maximum: 10000 }

  before_validation :calculate_word_count
  before_create :set_position

  # Returns the effective timestamp (written_at if set, otherwise created_at)
  def effective_timestamp
    written_at || created_at
  end

  # Returns true if this contribution was written by a super admin impersonating someone
  def impersonated?
    written_by_id.present? && written_by_id != user_id
  end

  # Returns the actual writer (the super admin who impersonated, or the user if no impersonation)
  def actual_writer
    written_by_user || user
  end

  private

  def calculate_word_count
    self.word_count = content.to_s.split(/\s+/).reject(&:blank?).count
  end

  def set_position
    self.position = (story.contributions.maximum(:position) || 0) + 1
  end
end

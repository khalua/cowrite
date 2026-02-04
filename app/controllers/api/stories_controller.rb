class Api::StoriesController < Api::BaseController
  before_action :set_circle, only: [:index, :create]
  before_action :set_story, only: [:show, :complete]
  before_action :authorize_circle_access!, only: [:index, :create]
  before_action :authorize_story_access!, only: [:show, :complete]

  def index
    stories = @circle.stories.includes(:contributions, :starter)
    render json: stories.map { |s| story_json(s) }
  end

  def show
    render json: story_json(@story, include_contributions: true)
  end

  def create
    story = @circle.stories.build(story_params)
    story.starter = current_user

    Story.transaction do
      story.save!

      # Create initial contribution if provided
      if params[:story][:initial_content].present?
        story.contributions.create!(
          user: current_user,
          content: params[:story][:initial_content]
        )
      end
    end

    render json: story_json(story, include_contributions: true), status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages.join(", ") }, status: :unprocessable_entity
  end

  def complete
    @story.complete!
    render json: story_json(@story)
  end

  private

  def super_admin?
    current_user.is_super_admin
  end

  def set_circle
    @circle = Circle.find(params[:circle_id])
  end

  def set_story
    @story = Story.find(params[:id])
  end

  def authorize_circle_access!
    return if super_admin?
    return if current_user.member_of?(@circle)
    render json: { error: "You are not a member of this circle" }, status: :forbidden
  end

  def authorize_story_access!
    return if super_admin?
    return if current_user.member_of?(@story.circle)
    render json: { error: "You are not a member of this story's circle" }, status: :forbidden
  end

  def story_params
    params.require(:story).permit(:title, :prompt)
  end

  def story_json(story, include_contributions: false)
    json = {
      id: story.id,
      title: story.title,
      prompt: story.prompt,
      circle_id: story.circle_id,
      started_by_id: story.started_by_id,
      status: story.status,
      created_at: story.created_at,
      contributions_count: story.contributions_count,
      word_count: story.word_count
    }

    if include_contributions
      json[:contributions] = story.contributions.includes(:user, :written_by_user).map do |c|
        contribution_data = {
          id: c.id,
          story_id: c.story_id,
          user_id: c.user_id,
          content: c.content,
          word_count: c.word_count,
          position: c.position,
          created_at: c.created_at,
          written_at: c.written_at,
          user: {
            id: c.user.id,
            name: c.user.name,
            email: c.user.email
          }
        }

        # Include impersonation info for super admins
        if c.impersonated? && super_admin?
          contribution_data[:impersonated] = true
          contribution_data[:written_by] = {
            id: c.written_by_user.id,
            name: c.written_by_user.name,
            email: c.written_by_user.email
          }
        end

        contribution_data
      end

      # For super admins, include circle members for impersonation dropdown
      if super_admin?
        json[:circle_members] = story.circle.members.map do |member|
          {
            id: member.id,
            name: member.name,
            email: member.email
          }
        end
      end
    end

    json
  end
end

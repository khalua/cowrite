class Api::ContributionsController < Api::BaseController
  before_action :set_story, except: [:update]
  before_action :set_contribution, only: [:update]
  before_action :authorize_access!, except: [:update]
  before_action :authorize_edit!, only: [:update]
  before_action :check_story_active!, only: [:create], unless: :super_admin?

  def create
    contribution = @story.contributions.build(contribution_params)

    if super_admin? && params[:contribution][:user_id].present?
      # Super admin impersonating another user
      impersonated_user = User.find(params[:contribution][:user_id])
      contribution.user = impersonated_user
      contribution.written_by_user = current_user

      # Allow custom timestamp (parsed from ISO 8601 string with timezone)
      if params[:contribution][:written_at].present?
        contribution.written_at = Time.zone.parse(params[:contribution][:written_at])
      end
    else
      # Normal user writing as themselves
      contribution.user = current_user
    end

    if contribution.save
      broadcast_new_contribution(contribution)
      render json: contribution_json(contribution), status: :created
    else
      render json: { error: contribution.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    if @contribution.update(content: params[:contribution][:content])
      broadcast_contribution_updated(@contribution)
      render json: contribution_json(@contribution)
    else
      render json: { error: @contribution.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  private

  def set_contribution
    @contribution = Contribution.find(params[:id])
    @story = @contribution.story
  end

  def authorize_edit!
    # Users can only edit their own contributions
    return if @contribution.user_id == current_user.id

    render json: { error: "You can only edit your own contributions" }, status: :forbidden
  end

  def set_story
    @story = Story.find(params[:story_id])
  end

  def super_admin?
    current_user.is_super_admin
  end

  def authorize_access!
    # Super admins can access any story
    return if super_admin?
    # Regular users must be circle members
    return if current_user.member_of?(@story.circle)

    render json: { error: "You are not a member of this story's circle" }, status: :forbidden
  end

  def check_story_active!
    return if @story.status == "active"
    render json: { error: "This story is no longer accepting contributions" }, status: :unprocessable_entity
  end

  def contribution_params
    params.require(:contribution).permit(:content)
  end

  def contribution_json(contribution)
    json = {
      id: contribution.id,
      story_id: contribution.story_id,
      user_id: contribution.user_id,
      content: contribution.content,
      word_count: contribution.word_count,
      position: contribution.position,
      created_at: contribution.created_at,
      written_at: contribution.written_at,
      user: {
        id: contribution.user.id,
        name: contribution.user.name,
        email: contribution.user.email
      }
    }

    # Include impersonation info for super admins
    if contribution.impersonated? && current_user.is_super_admin
      json[:impersonated] = true
      json[:written_by] = {
        id: contribution.written_by_user.id,
        name: contribution.written_by_user.name,
        email: contribution.written_by_user.email
      }
    end

    json
  end

  def broadcast_new_contribution(contribution)
    ActionCable.server.broadcast(
      "story_#{contribution.story_id}",
      {
        type: "new_contribution",
        contribution: contribution_json(contribution)
      }
    )
  end

  def broadcast_contribution_updated(contribution)
    ActionCable.server.broadcast(
      "story_#{contribution.story_id}",
      {
        type: "contribution_updated",
        contribution: contribution_json(contribution)
      }
    )
  end
end

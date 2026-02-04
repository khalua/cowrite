class Api::Admin::ContributionsController < Api::Admin::BaseController
  def update
    contribution = Contribution.find(params[:id])

    # Build update params
    update_params = {}
    update_params[:content] = params[:contribution][:content] if params[:contribution][:content].present?

    # Allow changing the attributed user (impersonation)
    if params[:contribution][:user_id].present?
      contribution.user = User.find(params[:contribution][:user_id])
    end

    # Track who made the edit
    contribution.written_by_user = current_user

    # Allow custom timestamp
    if params[:contribution][:written_at].present?
      contribution.written_at = Time.zone.parse(params[:contribution][:written_at])
    end

    if contribution.update(update_params)
      render json: contribution_json(contribution)
    else
      render json: { error: contribution.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def destroy
    contribution = Contribution.find(params[:id])
    story = contribution.story

    contribution.destroy!

    # Reorder remaining contributions
    story.contributions.order(:position).each_with_index do |c, index|
      c.update_column(:position, index + 1)
    end

    render json: { message: "Contribution deleted successfully" }
  end

  private

  def contribution_json(contribution)
    data = {
      id: contribution.id,
      story_id: contribution.story_id,
      content: contribution.content,
      word_count: contribution.word_count,
      position: contribution.position,
      created_at: contribution.created_at,
      user: {
        id: contribution.user.id,
        name: contribution.user.name,
        email: contribution.user.email
      }
    }

    if contribution.impersonated?
      data[:impersonation] = {
        written_by: {
          id: contribution.written_by_user.id,
          name: contribution.written_by_user.name
        },
        written_at: contribution.written_at
      }
    end

    data
  end
end

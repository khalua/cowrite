class Api::CirclesController < Api::BaseController
  before_action :set_circle, only: [:show, :update, :destroy]
  before_action :authorize_member!, only: [:show]
  before_action :authorize_admin!, only: [:update, :destroy]

  def index
    circles = current_user.circles.includes(:circle_members, :members)
    render json: circles.map { |c| circle_json(c) }
  end

  def show
    render json: circle_json(@circle)
  end

  def create
    circle = current_user.created_circles.build(circle_params)

    if circle.save
      render json: circle_json(circle), status: :created
    else
      render json: { error: circle.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    if @circle.update(circle_params)
      render json: circle_json(@circle)
    else
      render json: { error: @circle.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def destroy
    @circle.destroy
    head :no_content
  end

  private

  def set_circle
    @circle = Circle.find(params[:id])
  end

  def authorize_member!
    return if super_admin?
    return if current_user.member_of?(@circle)
    render json: { error: "You are not a member of this circle" }, status: :forbidden
  end

  def authorize_admin!
    return if super_admin?
    return if current_user.admin_of?(@circle)
    render json: { error: "You must be an admin to perform this action" }, status: :forbidden
  end

  def super_admin?
    current_user.is_super_admin
  end

  def circle_params
    params.require(:circle).permit(:name, :description)
  end

  def circle_json(circle)
    {
      id: circle.id,
      name: circle.name,
      description: circle.description,
      created_by_id: circle.created_by_id,
      created_at: circle.created_at,
      stories_count: circle.stories_count,
      members: circle.circle_members.includes(:user).map do |cm|
        {
          id: cm.id,
          user_id: cm.user_id,
          circle_id: cm.circle_id,
          role: cm.role,
          joined_at: cm.created_at,
          user: {
            id: cm.user.id,
            email: cm.user.email,
            name: cm.user.name
          }
        }
      end
    }
  end
end

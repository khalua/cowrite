class Api::Admin::CirclesController < Api::Admin::BaseController
  def index
    circles = Circle.includes(:creator, :circle_members, :members, :stories)
                    .order(created_at: :desc)

    render json: circles.map { |c| circle_json(c) }
  end

  def show
    circle = Circle.includes(:creator, :circle_members, :members, :stories).find(params[:id])
    render json: circle_json(circle)
  end

  private

  def circle_json(circle)
    {
      id: circle.id,
      name: circle.name,
      description: circle.description,
      created_by_id: circle.created_by_id,
      created_at: circle.created_at,
      stories_count: circle.stories.count,
      members_count: circle.members.count,
      creator: {
        id: circle.creator.id,
        name: circle.creator.name,
        email: circle.creator.email
      },
      members: circle.circle_members.includes(:user).map do |cm|
        {
          id: cm.id,
          user_id: cm.user_id,
          role: cm.role,
          joined_at: cm.created_at,
          user: {
            id: cm.user.id,
            email: cm.user.email,
            name: cm.user.name
          }
        }
      end,
      stories: circle.stories.order(created_at: :desc).map do |s|
        {
          id: s.id,
          title: s.title,
          status: s.status,
          contributions_count: s.contributions_count,
          created_at: s.created_at
        }
      end
    }
  end
end

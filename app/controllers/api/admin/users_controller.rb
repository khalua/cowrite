class Api::Admin::UsersController < Api::Admin::BaseController
  def index
    users = User.includes(:circles, :contributions)
                .order(created_at: :desc)

    render json: users.map { |u| user_json(u) }
  end

  def show
    user = User.includes(:circles, :contributions).find(params[:id])
    render json: user_detail_json(user)
  end

  def impersonate
    user = User.find(params[:id])

    # Generate a new token for the impersonated user
    token = JwtService.encode(user_id: user.id)

    render json: {
      message: "Now impersonating #{user.name}",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_super_admin: user.is_super_admin
      }
    }
  end

  private

  def user_json(user)
    {
      id: user.id,
      email: user.email,
      name: user.name,
      is_super_admin: user.is_super_admin,
      created_at: user.created_at,
      circles_count: user.circles.count,
      contributions_count: user.contributions.count
    }
  end

  def user_detail_json(user)
    {
      id: user.id,
      email: user.email,
      name: user.name,
      is_super_admin: user.is_super_admin,
      created_at: user.created_at,
      circles: user.circles.map do |c|
        {
          id: c.id,
          name: c.name,
          role: user.admin_of?(c) ? "admin" : "member"
        }
      end,
      contributions: user.contributions.includes(:story).order(created_at: :desc).limit(20).map do |c|
        {
          id: c.id,
          story_id: c.story_id,
          story_title: c.story.title,
          word_count: c.word_count,
          created_at: c.created_at
        }
      end
    }
  end
end

class Api::AuthController < Api::BaseController
  skip_before_action :authenticate_user!, only: [:login, :register]

  def login
    user = User.find_by(email: params[:email]&.downcase)

    if user&.authenticate(params[:password])
      token = JwtService.encode(user_id: user.id)
      render json: { user: user_json(user), token: token }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def register
    user = User.new(register_params)

    if user.save
      token = JwtService.encode(user_id: user.id)
      render json: { user: user_json(user), token: token }, status: :created
    else
      render json: { error: user.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def logout
    # In a stateless JWT setup, logout is handled client-side
    # For added security, you could implement token blacklisting
    render json: { message: "Logged out successfully" }
  end

  def me
    render json: user_json(current_user)
  end

  private

  def register_params
    params.permit(:email, :password, :name)
  end

  def user_json(user)
    {
      id: user.id,
      email: user.email,
      name: user.name,
      is_super_admin: user.is_super_admin,
      created_at: user.created_at
    }
  end
end

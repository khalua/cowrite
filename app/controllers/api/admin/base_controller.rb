class Api::Admin::BaseController < Api::BaseController
  before_action :require_super_admin!

  private

  def require_super_admin!
    return if current_user&.is_super_admin

    render json: { error: "Super admin access required" }, status: :forbidden
  end
end

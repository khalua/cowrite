module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # Get token from query params (WebSocket doesn't support headers easily)
      token = request.params[:token]
      return reject_unauthorized_connection unless token

      decoded = JwtService.decode(token)
      return reject_unauthorized_connection unless decoded

      user = User.find_by(id: decoded[:user_id])
      return reject_unauthorized_connection unless user

      user
    end
  end
end

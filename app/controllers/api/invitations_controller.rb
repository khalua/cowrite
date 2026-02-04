class Api::InvitationsController < Api::BaseController
  before_action :set_circle, only: [:create]
  before_action :authorize_member!, only: [:create]
  skip_before_action :authenticate_user!, only: [:show, :accept]

  def show
    invitation = Invitation.find_by!(token: params[:token])

    if invitation.expired?
      render json: { error: "This invitation has expired" }, status: :gone
      return
    end

    if invitation.status != "pending"
      render json: { error: "This invitation has already been used" }, status: :gone
      return
    end

    render json: {
      email: invitation.email,
      circle_name: invitation.circle.name,
      inviter_name: invitation.inviter.name
    }
  end

  def create
    invitation = @circle.invitations.build(
      email: params[:email],
      inviter: current_user
    )

    if invitation.save
      InvitationMailer.invite(invitation).deliver_later
      render json: invitation_json(invitation), status: :created
    else
      render json: { error: invitation.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def accept
    invitation = Invitation.find_by!(token: params[:token])

    if invitation.expired?
      render json: { error: "This invitation has expired" }, status: :gone
      return
    end

    if invitation.status != "pending"
      render json: { error: "This invitation has already been used" }, status: :gone
      return
    end

    # If user is logged in, use their account
    # If not, they need to register first
    authenticate_user!
    return unless current_user

    if current_user.member_of?(invitation.circle)
      render json: { error: "You are already a member of this circle" }, status: :unprocessable_entity
      return
    end

    if invitation.accept!(current_user)
      render json: circle_json(invitation.circle)
    else
      render json: { error: "Failed to accept invitation" }, status: :unprocessable_entity
    end
  end

  private

  def set_circle
    @circle = Circle.find(params[:circle_id])
  end

  def authorize_member!
    return if current_user.member_of?(@circle)
    render json: { error: "You are not a member of this circle" }, status: :forbidden
  end

  def invitation_json(invitation)
    {
      id: invitation.id,
      circle_id: invitation.circle_id,
      email: invitation.email,
      token: invitation.token,
      status: invitation.status,
      invited_by_id: invitation.invited_by_id,
      created_at: invitation.created_at
    }
  end

  def circle_json(circle)
    {
      id: circle.id,
      name: circle.name,
      description: circle.description
    }
  end
end

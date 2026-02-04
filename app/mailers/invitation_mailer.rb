class InvitationMailer < ApplicationMailer
  def invite(invitation)
    @invitation = invitation
    @circle = invitation.circle
    @inviter = invitation.inviter
    @accept_url = "#{app_url}/invitations/#{invitation.token}"

    mail(
      to: invitation.email,
      subject: "#{@inviter.name} invited you to join #{@circle.name} on CoWrite"
    )
  end

  private

  def app_url
    ENV.fetch("APP_URL", "http://localhost:3000")
  end
end

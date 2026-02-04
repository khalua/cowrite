class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("EMAIL_FROM", "CoWrite <noreply@cowrite.com>")
  layout "mailer"
end

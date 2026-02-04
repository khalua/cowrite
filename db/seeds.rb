# Create super admin account
admin_email = ENV.fetch("ADMIN_EMAIL", "admin@cowrite.com")
admin_password = ENV.fetch("ADMIN_PASSWORD", "password123")

admin = User.find_or_initialize_by(email: admin_email)
admin.assign_attributes(
  name: "Super Admin",
  password: admin_password,
  is_super_admin: true
)

if admin.new_record?
  admin.save!
  puts "Created super admin account: #{admin_email}"
else
  puts "Super admin already exists: #{admin_email}"
end

# Development seed data
if Rails.env.development?
  # Create some test users
  users = []
  ["Alice Writer", "Bob Author", "Charlie Scribe"].each_with_index do |name, i|
    email = "#{name.split.first.downcase}@example.com"
    user = User.find_or_create_by!(email: email) do |u|
      u.name = name
      u.password = "password123"
    end
    users << user
    puts "Created user: #{email}"
  end

  # Create a sample circle
  circle = Circle.find_or_create_by!(name: "The Storytellers") do |c|
    c.creator = users.first
    c.description = "A circle for collaborative fantasy stories"
  end
  puts "Created circle: #{circle.name}"

  # Add other users to the circle
  users[1..].each do |user|
    unless user.member_of?(circle)
      circle.circle_members.create!(user: user, role: "member")
      puts "Added #{user.name} to #{circle.name}"
    end
  end

  # Create a sample story
  story = Story.find_or_create_by!(title: "The Enchanted Forest", circle: circle) do |s|
    s.starter = users.first
    s.prompt = "Deep in the heart of an ancient forest, where no human had ventured for a thousand years..."
  end
  puts "Created story: #{story.title}"

  # Add some contributions if none exist
  if story.contributions.empty?
    contributions = [
      { user: users[0], content: "Deep in the heart of an ancient forest, where no human had ventured for a thousand years, a young explorer named Maya pushed through the dense undergrowth. The trees here were unlike any she had seen – their bark shimmered with an ethereal blue light." },
      { user: users[1], content: "Maya paused, her breath catching in her throat. Before her stood a clearing bathed in moonlight, though it was midday. In the center, a crystal spring bubbled with water that seemed to sing a melody she almost recognized." },
      { user: users[2], content: "As she approached the spring, the melody grew stronger. Words began to form in her mind, not spoken but felt. 'You seek what was lost,' the voice whispered. 'But first, you must answer: what are you willing to give up?'" }
    ]

    contributions.each do |c|
      story.contributions.create!(user: c[:user], content: c[:content])
      puts "Added contribution from #{c[:user].name}"
    end
  end
end

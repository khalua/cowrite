class Api::Admin::StoriesController < Api::Admin::BaseController
  def index
    stories = Story.includes(:circle, :starter, :contributions)
                   .order(created_at: :desc)

    render json: stories.map { |s| story_json(s) }
  end

  def show
    story = Story.includes(:circle, :starter, contributions: :user).find(params[:id])
    render json: story_detail_json(story)
  end

  private

  def story_json(story)
    {
      id: story.id,
      title: story.title,
      prompt: story.prompt,
      status: story.status,
      created_at: story.created_at,
      contributions_count: story.contributions_count,
      word_count: story.word_count,
      circle: {
        id: story.circle.id,
        name: story.circle.name
      },
      starter: {
        id: story.starter.id,
        name: story.starter.name,
        email: story.starter.email
      }
    }
  end

  def story_detail_json(story)
    {
      id: story.id,
      title: story.title,
      prompt: story.prompt,
      status: story.status,
      created_at: story.created_at,
      contributions_count: story.contributions_count,
      word_count: story.word_count,
      circle: {
        id: story.circle.id,
        name: story.circle.name,
        members: story.circle.circle_members.includes(:user).map do |cm|
          {
            id: cm.user.id,
            name: cm.user.name,
            email: cm.user.email
          }
        end
      },
      starter: {
        id: story.starter.id,
        name: story.starter.name,
        email: story.starter.email
      },
      contributions: story.contributions.order(:position).map do |c|
        contribution_json(c)
      end
    }
  end

  def contribution_json(contribution)
    data = {
      id: contribution.id,
      content: contribution.content,
      word_count: contribution.word_count,
      position: contribution.position,
      created_at: contribution.created_at,
      user: {
        id: contribution.user.id,
        name: contribution.user.name,
        email: contribution.user.email
      }
    }

    if contribution.impersonated?
      data[:impersonation] = {
        written_by: {
          id: contribution.written_by_user.id,
          name: contribution.written_by_user.name
        },
        written_at: contribution.written_at
      }
    end

    data
  end
end

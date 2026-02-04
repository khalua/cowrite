class StoryChannel < ApplicationCable::Channel
  def subscribed
    story = Story.find(params[:story_id])

    # Verify user has access to this story's circle
    if current_user.member_of?(story.circle)
      stream_from "story_#{params[:story_id]}"
    else
      reject
    end
  end

  def unsubscribed
    # Clean up when channel is unsubscribed
  end
end

Rails.application.routes.draw do
  # API routes
  namespace :api do
    # Authentication
    post "auth/login", to: "auth#login"
    post "auth/register", to: "auth#register"
    delete "auth/logout", to: "auth#logout"
    get "auth/me", to: "auth#me"

    # Circles
    resources :circles do
      resources :invitations, only: [:create]
      resources :stories, only: [:index, :create]
    end

    # Invitations
    get "invitations/:token", to: "invitations#show"
    post "invitations/:token/accept", to: "invitations#accept"

    # Stories
    resources :stories, only: [:show] do
      patch "complete", on: :member
      resources :contributions, only: [:create]
    end

    # Standalone contributions route for editing
    resources :contributions, only: [:update]

    # Admin routes (super admin only)
    namespace :admin do
      resources :circles, only: [:index, :show, :destroy]
      resources :stories, only: [:index, :show]
      resources :users, only: [:index, :show, :destroy] do
        post "impersonate", on: :member
      end
      resources :contributions, only: [:update, :destroy]
    end
  end

  # Action Cable
  mount ActionCable.server => "/cable"

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Serve React frontend for all other routes (SPA catch-all)
  # Exclude API, cable, rails, and static asset paths
  get "*path", to: "frontend#index", constraints: ->(req) {
    !req.path.start_with?("/api", "/cable", "/rails", "/assets", "/frontend")
  }
  root "frontend#index"
end

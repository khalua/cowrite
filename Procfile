web: bin/rails server -p ${PORT:-3000} -e ${RAILS_ENV:-production}
worker: bundle exec rake solid_queue:start
release: bin/rails db:migrate db:migrate:queue

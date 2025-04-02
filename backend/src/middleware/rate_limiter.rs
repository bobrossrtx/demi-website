use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

pub struct RateLimiter {
    pub max_requests: usize,
    pub window: Duration,
    pub clients: Arc<Mutex<HashMap<String, (usize, Instant)>>>,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window: Duration) -> Self {
        RateLimiter {
            max_requests,
            window,
            clients: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn check_rate_limit(&self, client_id: &str) -> bool {
        let mut clients = self.clients.lock().unwrap();
        let now = Instant::now();

        if let Some((count, timestamp)) = clients.get_mut(client_id) {
            if now.duration_since(*timestamp) > self.window {
                *count = 1;
                *timestamp = now;
                return true;
            } else if *count < self.max_requests {
                *count += 1;
                return true;
            } else {
                return false;
            }
        } else {
            clients.insert(client_id.to_string(), (1, now));
            return true;
        }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for &'r RateLimiter {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<&'r RateLimiter, Self::Error> {
        let rate_limiter = request.rocket().state::<RateLimiter>();
        if let Some(rate_limiter) = rate_limiter {
            let client_id = request
                .client_ip()
                .map(|ip| ip.to_string())
                .unwrap_or_else(|| "unknown".to_string());

            if rate_limiter.check_rate_limit(&client_id) {
                Outcome::Success(rate_limiter)
            } else {
                Outcome::Error((Status::TooManyRequests, ()))
            }
        } else {
            Outcome::Error((Status::InternalServerError, ()))
        }
    }
}
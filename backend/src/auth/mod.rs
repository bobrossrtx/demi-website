pub mod admin;
pub mod auth;
pub mod jwt;

use crate::middleware::rate_limiter::RateLimiter;
use rocket::fairing::AdHoc;
use rocket::Route;
use self::auth::{
    change_password, delete_profile, edit_profile, generate_reset_token, get_profile, login, logout,
    register, reset_password, update_profile_picture, delete_profile_picture, verify_account, verify_admin,
    refresh_token, user_by_refresh_token, is_authenticated,
};

pub fn auth_routes() -> Vec<Route> {
    routes![
        register,
        login,
        logout,
        generate_reset_token,
        reset_password,
        verify_admin,
        get_profile,
        edit_profile,
        update_profile_picture,
        change_password,
        delete_profile,
        verify_account,
        delete_profile_picture,
        refresh_token,
        user_by_refresh_token,
        is_authenticated,
        // Uncomment the following lines to include admin routes
        // get_users,
        // update_user,
        // delete_user,
        // create_user
    ]
}

pub fn attach_rate_limiter() -> AdHoc {
    AdHoc::on_ignite("Rate Limiter", |rocket| async {
        rocket.manage(RateLimiter::new(5, std::time::Duration::from_secs(60)))
    })
}
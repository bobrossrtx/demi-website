pub mod auth;
pub mod jwt;
pub mod admin;

use rocket::Route;
use self::auth::{register, login, generate_reset_token, reset_password, verify_admin, get_profile, edit_profile, update_profile_picture, change_password, delete_profile};
// use self::admin::{get_users, update_user, delete_user, create_user};

pub fn auth_routes() -> Vec<Route> {
    routes![
        register, 
        login, 
        generate_reset_token, 
        reset_password, 
        verify_admin,
        get_profile,
        edit_profile,
        update_profile_picture,
        change_password,
        delete_profile,
        // Uncomment the following lines to include admin routes
        // get_users,
        // update_user,
        // delete_user,
        // create_user
    ]
}
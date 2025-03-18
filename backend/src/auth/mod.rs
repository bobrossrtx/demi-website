pub mod auth;
pub mod jwt;
pub mod admin;

use rocket::Route;
use self::auth::{register, login, generate_reset_token, reset_password, verify_admin, get_profile, edit_profile, update_profile_picture};
// use self::admin::{get_users, update_user, delete_user, create_user};

pub fn routes() -> Vec<Route> {
    routes![
        register, 
        login, 
        generate_reset_token, 
        reset_password, 
        verify_admin,
        get_profile,
        edit_profile,
        update_profile_picture,
        // get_users,
        // update_user,
        // delete_user,
        // create_user
    ]
}
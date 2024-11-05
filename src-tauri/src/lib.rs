mod win;

use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder};
use tauri::{AppHandle, Manager};
use tauri_plugin_prevent_default::Flags;
use win::{get_taskbar_region, send_inputs};
use windows::core::*;
use windows::Win32::Foundation::RECT;
use windows::Win32::UI::Input::KeyboardAndMouse::{VK_RETURN, VK_TAB};
use windows::Win32::UI::WindowsAndMessaging::{
    FindWindowA, GetWindowRect, SetForegroundWindow, ShowWindow, SW_RESTORE,
};

static IS_APP_READY: AtomicBool = AtomicBool::new(false);

fn setup_window(app: &AppHandle) {
    if !IS_APP_READY.load(Ordering::Relaxed) {
        return;
    }

    let window = app.get_webview_window("main").unwrap();
    let primary_screen = window.primary_monitor().unwrap().unwrap();
    let primary_screen_scale_factor = primary_screen.scale_factor();
    let screen = window.current_monitor().unwrap().unwrap();
    let screen_position = screen.position();
    let screen_size = screen.size();
    let screen_scale_factor = screen.scale_factor();
    let logical_size = window.outer_size().unwrap();
    let taskbar_region = get_taskbar_region().unwrap();

    println!(
        "\nScreen Pos   X{} Y{}",
        screen_position.x, screen_position.y
    );
    println!("Screen SF    {}", screen_scale_factor);
    println!(
        "Screen Size  W{} H{}",
        screen_size.width, screen_size.height
    );
    println!(
        "Outer Size   W{} H{}",
        logical_size.width, logical_size.height
    );
    println!(
        "Taskbar Rect T{} R{} B{} L{}",
        taskbar_region.top, taskbar_region.right, taskbar_region.bottom, taskbar_region.left
    );
    let result_position = tauri::PhysicalPosition {
        x: screen_position.x + (screen_size.width - logical_size.width) as i32,
        y: screen_position.y + (screen_size.height - logical_size.height) as i32
            // explanation: taskbar_region takes taskbar size from primary monitor, now adjust to current scale factor
            - (f64::from(taskbar_region.bottom - taskbar_region.top)
                / (primary_screen_scale_factor / screen_scale_factor)) as i32,
    };
    println!("Result Pos   X{} Y{}", result_position.x, result_position.y);
    let _ = window.set_position(tauri::Position::Physical(result_position));
    let _ = window.show().unwrap();
    let _ = window.set_focus();
}

#[tauri::command]
fn ready(app_handle: AppHandle) {
    IS_APP_READY.store(true, Ordering::Relaxed);
    setup_window(&app_handle);
}

#[tauri::command]
fn login(username: &str, password: &str) -> std::result::Result<String, String> {
    println!("\nlogin proc");
    unsafe {
        let hwnd_res = FindWindowA(None, s!("Riot Client"));
        if hwnd_res.is_err() {
            return Err("Couldn't find riot client".into());
        }
        let hwnd = hwnd_res.unwrap();
        println!("hwnd:     {:?}", hwnd);

        let _ = SetForegroundWindow(hwnd);
        let _ = ShowWindow(hwnd, SW_RESTORE);

        let mut client_rect = RECT::default();
        if GetWindowRect(hwnd, &mut client_rect).is_err() {
            return Err("Couldn't retrieve riot client rect".into());
        }
        println!(
            "rect:     L{} R{} T{} B{}",
            client_rect.left, client_rect.right, client_rect.top, client_rect.bottom
        );

        let (center_x, center_y) = (
            (client_rect.left + client_rect.right) / 2,
            (client_rect.top + client_rect.bottom) / 2,
        );
        println!("center:   X{} Y{}", center_x, center_y);

        send_inputs(
            [
                win::click(center_x, center_y),
                win::virtual_key(VK_TAB),
                win::write(username),
                win::virtual_key(VK_TAB),
                win::write(password),
                win::virtual_key(VK_RETURN),
            ]
            .concat(),
        );
    }
    Ok("Successfully logged in".into())
}

#[tauri::command]
fn argon_hash(password: &str) -> std::result::Result<String, ()> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    match argon2.hash_password(password.as_bytes(), &salt) {
        Ok(v) => Ok(v.to_string()),
        Err(_) => Err(()),
    }
}

#[tauri::command]
fn argon_verify(password: &str, hash: &str) -> std::result::Result<(), ()> {
    match PasswordHash::new(&hash) {
        Ok(parsed_hash) => {
            match Argon2::default().verify_password(password.as_bytes(), &parsed_hash) {
                Ok(_) => Ok(()),
                Err(_) => Err(()),
            }
        }
        Err(_) => Err(()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            let window = app.get_webview_window("main").unwrap();
            let _ = window.show().unwrap();
            let _ = window.set_focus();
        }))
        .plugin(
            tauri_plugin_prevent_default::Builder::new()
                .with_flags(Flags::all().difference(Flags::RELOAD))
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            login,
            ready,
            argon_hash,
            argon_verify
        ])
        .on_window_event(|_, event| match event {
            tauri::WindowEvent::Resized { .. } => {
                // Sleep for a millisecond (blocks the thread but it doesn't really matter)
                // https://github.com/tauri-apps/tauri/issues/6322#issuecomment-1448141495
                std::thread::sleep(Duration::from_millis(1));
            }
            _ => {}
        })
        .setup(|app| {
            #[cfg(desktop)]
            let _ = app.handle().plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                None,
            ));
            let _ = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray_icon, event| match event {
                    tauri::tray::TrayIconEvent::Click {
                        id: _,
                        position: _,
                        rect: _,
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Down,
                    }
                    | tauri::tray::TrayIconEvent::DoubleClick {
                        id: _,
                        position: _,
                        rect: _,
                        button: MouseButton::Left,
                    } => {
                        let window = tray_icon.app_handle().get_webview_window("main").unwrap();
                        if window.is_visible().unwrap_or(false) {
                            window.hide().unwrap();
                            return;
                        }
                        setup_window(tray_icon.app_handle());
                    }
                    _ => {}
                })
                .build(app);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod win;

use std::time::Duration;

use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder};
use tauri::Manager;
use win::get_taskbar_size;
use windows::core::*;
use windows::Win32::Foundation::RECT;
use windows::Win32::UI::Input::KeyboardAndMouse::{VK_RETURN, VK_TAB};
use windows::Win32::UI::WindowsAndMessaging::{
    FindWindowA, GetWindowRect, SetForegroundWindow, ShowWindow, SW_RESTORE,
};

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

        win::click(center_x, center_y);
        win::virtual_key(VK_TAB);
        win::write(username);
        win::virtual_key(VK_TAB);
        win::write(password);
        win::virtual_key(VK_RETURN);
    }
    Ok("Successfully logged in".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            let window = app.get_webview_window("main").unwrap();
            let _ = window.show().unwrap();
            let _ = window.set_focus();
        }))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![login])
        .on_window_event(|_, event| match event {
            tauri::WindowEvent::Resized { .. } => {
                // Sleep for a millisecond (blocks the thread but it doesn't really matter)
                // https://github.com/tauri-apps/tauri/issues/6322#issuecomment-1448141495
                std::thread::sleep(Duration::from_millis(1));
            }
            _ => {}
        })
        .setup(|app| {
            let _ = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray_icon, event| match event {
                    tauri::tray::TrayIconEvent::Click {
                        id,
                        position,
                        rect,
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Down,
                    }
                    | tauri::tray::TrayIconEvent::DoubleClick {
                        id,
                        position,
                        rect,
                        button: MouseButton::Left,
                    } => {
                        let window = tray_icon.app_handle().get_webview_window("main").unwrap();

                        if window.is_visible().unwrap_or(false) {
                            window.hide().unwrap();
                            return;
                        }

                        let _ = window.show().unwrap();
                        /*let logical_size = tauri::LogicalSize::<f64> {
                          width: 300.00,
                          height: 400.00,
                        };
                        let logical_s = tauri::Size::Logical(logical_size);
                        let _ = window.set_size(logical_s);*/
                        let screen = window.current_monitor().unwrap().unwrap();
                        let screen_position = screen.position();
                        let screen_size = screen.size();
                        let logical_size = window.outer_size().unwrap();
                        let taskbar_size = get_taskbar_size().unwrap();

                        // 46px 1080p 60px 1440p
                        // TODO FIGURE OUT HOW TO RETRIEVE PROPER TASKBAR SIZE ON SCREEN :)

                        println!(
                            "\nScreen Pos X{} Y{}",
                            screen.position().x,
                            screen.position().y
                        );
                        println!("Screen SF    {}", screen.scale_factor());
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
                            taskbar_size.top,
                            taskbar_size.right,
                            taskbar_size.bottom,
                            taskbar_size.left
                        );
                        let logical_position = tauri::LogicalPosition {
                            x: f64::from(screen_position.x)
                                + (f64::from(screen_size.width) - f64::from(logical_size.width))
                                    / screen.scale_factor(),
                            y: f64::from(screen_position.y)
                                + (f64::from(screen_size.height) - f64::from(logical_size.height))
                                    / screen.scale_factor()
                                - f64::from(taskbar_size.bottom - taskbar_size.top)
                                + 10.,
                        };
                        println!(
                            "Result Pos  X{} Y{}",
                            logical_position.x, logical_position.y
                        );
                        let _ = window.set_position(tauri::Position::Logical(logical_position));
                        let _ = window.set_focus();
                    }
                    _ => {}
                })
                .build(app);

            // TODO move to function
            let window = app.get_webview_window("main").unwrap();
            /*let logical_size = tauri::LogicalSize::<f64> {
              width: 300.00,
              height: 400.00,
            };
            let logical_s = tauri::Size::Logical(logical_size);
            let _ = window.set_size(logical_s);*/
            let screen = window.primary_monitor().unwrap().unwrap();
            let screen_position = screen.position();
            let screen_size = screen.size();
            let logical_size = window.outer_size().unwrap();
            let taskbar_size = get_taskbar_size().unwrap();

            // 46px 1080p 60px 1440p
            // TODO FIGURE OUT HOW TO RETRIEVE PROPER TASKBAR SIZE ON SCREEN :)

            println!(
                "\nScreen Pos X{} Y{}",
                screen.position().x,
                screen.position().y
            );
            println!("Screen SF    {}", screen.scale_factor());
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
                taskbar_size.top, taskbar_size.right, taskbar_size.bottom, taskbar_size.left
            );
            let logical_position = tauri::LogicalPosition {
                x: f64::from(screen_position.x)
                    + (f64::from(screen_size.width) - f64::from(logical_size.width))
                        / screen.scale_factor(),
                y: f64::from(screen_position.y)
                    + (f64::from(screen_size.height) - f64::from(logical_size.height))
                        / screen.scale_factor()
                    - f64::from(taskbar_size.bottom - taskbar_size.top)
                    + 10.,
            };
            println!(
                "Result Pos  X{} Y{}",
                logical_position.x, logical_position.y
            );
            let _ = window.set_position(tauri::Position::Logical(logical_position));
            let _ = window.show().unwrap();
            let _ = window.set_focus();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod win;

use std::time::Duration;

use windows::core::*;
use windows::Win32::Foundation::RECT;
use windows::Win32::UI::Input::KeyboardAndMouse::{VK_RETURN, VK_TAB};
use windows::Win32::UI::WindowsAndMessaging::{FindWindowA, GetWindowRect, SetForegroundWindow, ShowWindow, SW_RESTORE};


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
        println!("rect:     L{} R{} T{} B{}", client_rect.left, client_rect.right, client_rect.top, client_rect.bottom);

        let (center_x, center_y) = ((client_rect.left + client_rect.right) / 2, (client_rect.top + client_rect.bottom) / 2);
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
        .plugin(tauri_plugin_single_instance::init(|_, _, _| {}))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![login])
        .on_window_event(|_, event| match event {
            tauri::WindowEvent::Resized { .. } => {
              // Sleep for a millisecond (blocks the thread but it doesn't really matter)
              // https://github.com/tauri-apps/tauri/issues/6322#issuecomment-1448141495
              std::thread::sleep(Duration::from_millis(1));
            },
            _ => {},
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

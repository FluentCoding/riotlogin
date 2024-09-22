use std::mem;

use windows::Win32::{
    Foundation::RECT,
    System::WindowsProgramming::MulDiv,
    UI::{
        Input::KeyboardAndMouse::{
            SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, INPUT_MOUSE, KEYBDINPUT, KEYBD_EVENT_FLAGS,
            KEYEVENTF_KEYUP, KEYEVENTF_UNICODE, MOUSEEVENTF_ABSOLUTE, MOUSEEVENTF_LEFTDOWN,
            MOUSEEVENTF_MOVE, MOUSEEVENTF_VIRTUALDESK, MOUSEINPUT, VIRTUAL_KEY,
        },
        WindowsAndMessaging::{
            GetSystemMetrics, SystemParametersInfoW, SM_CXSCREEN, SM_CXVIRTUALSCREEN, SM_CYSCREEN,
            SM_CYVIRTUALSCREEN, SPI_GETWORKAREA, SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS,
        },
    },
};

// only chatgpt code in the entire app ggwp
pub fn get_taskbar_region() -> Option<RECT> {
    unsafe {
        // Get the full screen size
        let screen_width = GetSystemMetrics(SM_CXSCREEN);
        let screen_height = GetSystemMetrics(SM_CYSCREEN);

        // Initialize a RECT to receive the work area (usable desktop area)
        let mut work_area: RECT = mem::zeroed();

        // Get the work area (the part of the screen not used by the taskbar)
        if SystemParametersInfoW(
            SPI_GETWORKAREA,
            0,
            Some(&mut work_area as *mut RECT as *mut _),
            SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS(0),
        )
        .is_err()
        {
            return None; // Failed to get work area
        }

        // Calculate the taskbar size by comparing full screen size and work area
        let taskbar_width = screen_width - (work_area.right - work_area.left);
        let taskbar_height = screen_height - (work_area.bottom - work_area.top);

        // Determine the position of the taskbar
        if taskbar_width > 0 {
            // Taskbar is on the left or right side
            if work_area.left > 0 {
                // Taskbar on the left
                Some(RECT {
                    left: 0,
                    top: 0,
                    right: taskbar_width,
                    bottom: screen_height,
                })
            } else {
                // Taskbar on the right
                Some(RECT {
                    left: work_area.right,
                    top: 0,
                    right: screen_width,
                    bottom: screen_height,
                })
            }
        } else if taskbar_height > 0 {
            // Taskbar is on the top or bottom
            if work_area.top > 0 {
                // Taskbar on the top
                Some(RECT {
                    left: 0,
                    top: 0,
                    right: screen_width,
                    bottom: taskbar_height,
                })
            } else {
                // Taskbar on the bottom
                Some(RECT {
                    left: 0,
                    top: work_area.bottom,
                    right: screen_width,
                    bottom: screen_height,
                })
            }
        } else {
            None // No taskbar detected
        }
    }
}

pub fn send_inputs(inputs: Vec<INPUT>) {
    unsafe {
        SendInput(inputs.as_slice(), size_of::<INPUT>() as i32);
    }
}

pub fn click(x: i32, y: i32) -> Vec<INPUT> {
    unsafe {
        vec![INPUT {
            r#type: INPUT_MOUSE,
            Anonymous: INPUT_0 {
                mi: MOUSEINPUT {
                    dx: MulDiv(x, 65535, GetSystemMetrics(SM_CXVIRTUALSCREEN)),
                    dy: MulDiv(y, 65535, GetSystemMetrics(SM_CYVIRTUALSCREEN)),
                    time: 0,
                    mouseData: 0,
                    dwFlags: MOUSEEVENTF_MOVE
                        | MOUSEEVENTF_LEFTDOWN
                        | MOUSEEVENTF_VIRTUALDESK
                        | MOUSEEVENTF_ABSOLUTE,
                    dwExtraInfo: 0,
                },
            },
        }]
    }
}

pub fn virtual_key(vk: VIRTUAL_KEY) -> Vec<INPUT> {
    vec![
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: vk,
                    time: 0,
                    dwFlags: KEYBD_EVENT_FLAGS(0), // down
                    wScan: 0,
                    dwExtraInfo: 0,
                },
            },
        },
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: vk,
                    time: 0,
                    dwFlags: KEYEVENTF_KEYUP, // up
                    wScan: 0,
                    dwExtraInfo: 0,
                },
            },
        },
    ]
}

pub fn write(text: &str) -> Vec<INPUT> {
    text.chars()
        .flat_map(|char| {
            vec![
                INPUT {
                    r#type: INPUT_KEYBOARD,
                    Anonymous: INPUT_0 {
                        ki: KEYBDINPUT {
                            wVk: windows::Win32::UI::Input::KeyboardAndMouse::VIRTUAL_KEY(0),
                            wScan: char as u16,
                            time: 0,
                            dwFlags: KEYEVENTF_UNICODE, // pressed
                            dwExtraInfo: 0,
                        },
                    },
                },
                INPUT {
                    r#type: INPUT_KEYBOARD,
                    Anonymous: INPUT_0 {
                        ki: KEYBDINPUT {
                            wVk: windows::Win32::UI::Input::KeyboardAndMouse::VIRTUAL_KEY(0),
                            wScan: char as u16,
                            time: 0,
                            dwFlags: KEYEVENTF_KEYUP, // pressed
                            dwExtraInfo: 0,
                        },
                    },
                },
            ]
        })
        .collect::<Vec<INPUT>>()
}

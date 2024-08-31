use windows::Win32::{System::WindowsProgramming::MulDiv, UI::{Input::KeyboardAndMouse::{SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, INPUT_MOUSE, KEYBDINPUT, KEYBD_EVENT_FLAGS, KEYEVENTF_KEYUP, KEYEVENTF_UNICODE, MOUSEEVENTF_ABSOLUTE, MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_MOVE, MOUSEEVENTF_VIRTUALDESK, MOUSEINPUT, VIRTUAL_KEY}, WindowsAndMessaging::{GetSystemMetrics, SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN}}};

pub fn click(x: i32, y: i32) {
  unsafe {
    SendInput(&[
      INPUT {
          r#type: INPUT_MOUSE,
          Anonymous: INPUT_0 {
              mi: MOUSEINPUT {
                  dx: MulDiv(x, 65535, GetSystemMetrics(SM_CXVIRTUALSCREEN)),
                  dy: MulDiv(y, 65535, GetSystemMetrics(SM_CYVIRTUALSCREEN)),
                  time: 0,
                  mouseData: 0,
                  dwFlags: MOUSEEVENTF_MOVE | MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_VIRTUALDESK | MOUSEEVENTF_ABSOLUTE,
                  dwExtraInfo: 0
              }
          }
      },
    ], size_of::<INPUT>() as i32);
  }
}

pub fn virtual_key(vk: VIRTUAL_KEY) {
  unsafe {
    SendInput(&[
      INPUT {
          r#type: INPUT_KEYBOARD,
          Anonymous: INPUT_0 {
              ki: KEYBDINPUT {
                  wVk: vk,
                  time: 0,
                  dwFlags: KEYBD_EVENT_FLAGS(0), // down
                  wScan: 0,
                  dwExtraInfo: 0
              }
          }
      },
      INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 {
            ki: KEYBDINPUT {
                wVk: vk,
                time: 0,
                dwFlags: KEYEVENTF_KEYUP, // up
                wScan: 0,
                dwExtraInfo: 0
            }
        }
    },
    ], size_of::<INPUT>() as i32);
  }
}

pub fn write(text: &str) {
  unsafe {
    let inputs = text.chars().map(|char| 
      INPUT {
          r#type: INPUT_KEYBOARD,
          Anonymous: INPUT_0 {
              ki: KEYBDINPUT {
                  wVk: windows::Win32::UI::Input::KeyboardAndMouse::VIRTUAL_KEY(0),
                  wScan: char as u16,
                  time: 0,
                  dwFlags: KEYEVENTF_UNICODE, // pressed
                  dwExtraInfo: 0
              }
          }
      }).collect::<Vec<INPUT>>();
    SendInput(inputs.as_slice(), size_of::<INPUT>() as i32);
  }
}
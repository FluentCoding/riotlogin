# Client

- Settings (e.g. select match history providers, autostart)
- Master-Password + 2FA
- Auto-Update implementation

# Server

- Rate-limited (per IP + DDoS protection) ranks endpoint
- Update server static JSON hosting

# Login

- Handle inactivity modal
- Handle incorrect credentials popout (purple)

# Prerelease

- Obfuscation
- Landing page + domain + webhosting (maybe hetzner)
- KoFi and Patreon (maybe PayPal)
- GitHub Action for windows releases

# Postrelease

- Optional tab group on top for all games (only support league for now)
- Show other ranks than SoloQ
- Color Themes
- Tooltips on rank (pulling state/last update timestamp)
- Code overhaul (a lot of code has been rushed to get it close to release without prioritizing modularity or even quality)
  - especially in modal code
  - should add typesafe backend communication or at least zod to validate the response

# Frontend

- Settings (e.g. select match history providers, autostart)

# Backend

- Store account passwords in operating system keychain
- Rate-limited (per IP + DDoS protection) league rank endpoint for many accounts
- Update server static JSON hosting

# Login

- Handle inactivity modal
- Handle incorrect credentials popout (purple)

# Before Publish

- Obfuscation
- Landing page + domain + webhosting (maybe hetzner)
- KoFi and Patreon (maybe PayPal)
- GitHub Action for windows releases

# After release

- Optional tab group on top for all games (only support league for now)
- Color themes
- Code overhaul (a lot of code has been rushed to get it close to release without prioritizing modularity or even quality)
  - especially in modal code
  - should add typesafe backend communication or at least zod to validate the response

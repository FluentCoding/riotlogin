# Frontend

- Cache-store (account id <-> latest pulled rank entry together with pull timestamp)
- Pull account ranks periodically
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

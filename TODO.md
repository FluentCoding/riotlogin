# Client

- Persistent Module: PhantomString where possible, migration implementation
- Allow reset of all data (e.g. if you forgot the master password)
- Ask for Master-Password on each startup
- Move Svelte components from /util to /common
- Auto-Update implementation

# Server

- Rate-limited (per IP + DDoS protection) ranks endpoint
- Update server static JSON hosting

# Login

- Handle inactivity modal
- Handle incorrect credentials popout (purple)

# Prerelease

- Remove all unused imports
- Landing page (+ credits) + domain + webhosting (maybe hetzner)
- KoFi
- GitHub Action for windows releases

# Postrelease

- ESLint + Prettier rules (force triple =, force explicit return type, potentially CI script)
- Option to save CSV of all entries (without password)
- Make match history providers selectable in settings
- Optional tab group on top for all games (only support league for now)
- Show other ranks than SoloQ
- Color Themes
- Tooltips on rank (pulling state/last update timestamp)
- Code overhaul (a lot of code has been rushed to get it close to release without prioritizing modularity or even quality)
  - especially in modal code
  - should add typesafe backend communication or at least zod to validate the response

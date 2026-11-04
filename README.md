# Void — Discord Moderation Bot

A full-featured public Discord moderation bot.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in:
```
TOKEN=your_bot_token
CLIENT_ID=your_bot_application_id
SUPPORT_SERVER_INVITE=https://discord.gg/KwgNyfauug
```

### 3. Deploy slash commands
```bash
npm run deploy
```

### 4. Start the bot
```bash
npm start
```

---

## Commands

### Moderation
| Command | Description |
|--------|-------------|
| `/lock [channel] [role1] [role2] [role3]` | Lock a channel; optionally allow specific roles |
| `/unlock [channel]` | Unlock a channel |
| `/ban <user> [reason] [delete_days]` | Ban a member (DMs them the support invite) |
| `/softban <user> [reason]` | Ban + unban to clear messages |
| `/kick <user> [reason]` | Kick a member |
| `/mute <user> <duration> [reason]` | Timeout a member |
| `/unmute <user>` | Remove a member's timeout |
| `/unban <user_id> [reason]` | Unban by user ID |
| `/role <user> <role>` | Toggle a role on a member |
| `/channel create <name> [type] [category]` | Create a channel |
| `/channel delete <channel>` | Delete a channel |

### Tickets
| Command | Description |
|--------|-------------|
| `/ticketpanel [channel]` | Post the ticket panel (staff only) |
| `/closeticket [reason]` | Close & transcript a ticket |

---

## Required Bot Permissions
- Manage Channels
- Manage Roles
- Kick Members
- Ban Members
- Moderate Members (Timeout)
- Read Message History
- Send Messages
- View Channels

## Required Privileged Intents (Discord Dev Portal)
- Server Members Intent
- Message Content Intent

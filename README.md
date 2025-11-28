# GetStream Chat Setup

A Node.js implementation for GetStream Chat API that demonstrates user creation, token generation, and sending messages to channels.

## Features

- ✅ Create or update users in GetStream
- ✅ Generate authentication tokens for users
- ✅ Send messages to channels
- ✅ Automatic channel creation if it doesn't exist

## Configuration

The application uses the following GetStream credentials (configured in `.env`):

- **App ID**: 1281034
- **API Key**: enq5hnqqhduv
- **API Secret**: 63pgb7rnpnpt83kbn4xm5txmnwxauq27734w24ctd978jvup3n9yyjfcyzv4baz8
- **Channel Type**: messaging

## Installation

```bash
npm install
```

## Usage

Run the application:

```bash
npm start
```

The script will:
1. Create/update a user with ID `user-123` and name `John Doe`
2. Generate an authentication token for the user
3. Send a message to the `general` channel

## Customization

You can modify the example values in `index.js`:

```javascript
const userId = 'user-123';      // Change user ID
const userName = 'John Doe';     // Change user name
const channelId = 'general';     // Change channel ID
const message = 'Hello!';        // Change message text
```

## API Functions

### `createOrUpdateUser(userId, userName)`
Creates a new user or updates an existing user.

**Parameters:**
- `userId` (string): Unique user identifier
- `userName` (string): User's display name

**Returns:** Promise<Object> - User object

### `generateUserToken(userId)`
Generates a JWT token for client-side authentication.

**Parameters:**
- `userId` (string): User identifier

**Returns:** string - JWT token

### `sendMessageToChannel(channelId, userId, messageText)`
Sends a message to a specific channel.

**Parameters:**
- `channelId` (string): Channel identifier
- `userId` (string): User sending the message
- `messageText` (string): Message content

**Returns:** Promise<Object> - Message response

## Example Output

```
🚀 Starting GetStream Chat Setup...

📝 Step 1: Creating/Updating User...
✅ User created/updated: John Doe (ID: user-123)

🔑 Step 2: Generating User Token...
✅ Token generated for user: user-123
Token: eyJhbGc...

💬 Step 3: Sending Message to Channel...
✅ Channel created/accessed: general
✅ Message sent to channel "general"
Message: "Hello! This is my first message using GetStream Chat API."
Message ID: user-123-abc123

✨ Setup completed successfully!
```

## Security Note

⚠️ **Important**: The `.env` file contains sensitive credentials and should never be committed to version control. It's already included in `.gitignore`.

## Documentation

For more information, visit the [GetStream Chat Documentation](https://getstream.io/chat/docs/).

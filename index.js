import { StreamChat } from 'stream-chat';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const channelType = process.env.CHANNEL_TYPE || 'messaging';

// Initialize Stream Chat server-side client
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

/**
 * Create or update a user in GetStream
 * @param {string} userId - Unique user identifier
 * @param {string} userName - User's display name
 * @returns {Promise<Object>} User object
 */
async function createOrUpdateUser(userId, userName,deviceID,platform) {
  try {

    serverClient
    // Check if user already exists
    const query = { id: { $eq: userId } };
    const res = await serverClient.queryUsers(query, { limit: 1 });
    if (res && res.users && res.users.length > 0) {
      console.log(`ℹ️ User already exists: ${res.users[0].name || ''} (ID: ${userId})`);
      return res.users[0];
    }
    console.log(`ℹ️ User not already exists ${userId}`);
    const token = generateUserToken(userId);

    const user = {
      id: userId,
      name: userName,
      role: 'user',
      token: token
    };
    // await serverClient.connectUser(user,token)
    // Create user since it does not exist
    await serverClient.upsertUser(user);
    if(deviceID != ""){
          console.log(`✅ User deviceID: ${deviceID}`);
          console.log(`✅ User platform: ${platform}`);

      if(platform == "iOS"){
       serverClient.addDevice(deviceID,'apn',userId,'apn')
      } 

      if(platform == "Android"){
      await serverClient.addDevice(deviceID,'firebase',userId,'Dardoc-Client-Android')
      }
    }
    console.log(`✅ User created: ${userName} (ID: ${userId})`);

    return user;
  } catch (error) {
    console.error('❌ Error creating/updating user:', error.message);
    throw error;
  }
}

/**
 * Ensure a channel exists and that the given members are present.
 * If the channel does not exist, create it and add the members.
 * If it exists, ensure the members are added.
 */
async function ensureChannelWithMembers(channelId,userName, memberIds = [], creatorId) {
  try {
    const channel = serverClient.channel(channelType, channelId, {
      name: `Weight Loss ${userName}`,
      created_by_id: creatorId,
    });

    // Try to query the channel to see if it exists
    let exists = false;
    try {
      await channel.query();
      exists = true;
      console.log(`ℹ️ Channel exists: ${channelId}`);
    } catch (err) {
      exists = false;
    }

    if (!exists) {
      // Create channel with the members
      await channel.create({
        id: channelId,
        members: memberIds,
        created_by_id: creatorId,
      });
      console.log(`✅ Channel created: ${channelId}`);
    } else if (memberIds && memberIds.length > 0) {
      // Add members (no-op for members already present)
      try {
        await channel.addMembers(memberIds);
        console.log(`✅ Members ensured for channel: ${memberIds.join(', ')}`);
      } catch (err) {
        // If addMembers isn't supported or fails, log and continue
        console.log('ℹ️ Could not add members (they may already exist):', err.message);
      }
    }

    return channel;
  } catch (error) {
    console.error('❌ Error ensuring channel and members:', error.message);
    throw error;
  }
}

/**
 * Generate user token for client-side authentication
 * @param {string} userId - User identifier
 * @returns {string} JWT token
 */
function generateUserToken(userId) {
  try {
    const token = serverClient.createToken(userId);
    console.log(`✅ Token generated for user: ${userId}`);
    console.log(`Token: ${token}`);
    return token;
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    throw error;
  }
}

/**
 * Send a message to a channel
 * @param {string} channelId - Channel identifier
 * @param {string} userId - User sending the message
 * @param {string} messageText - Message content
 * @returns {Promise<Object>} Message response
 */
async function sendMessageToChannel(channelId, userId,userName, messageText) {
  try {

    // Get or create the channel
    const channel = serverClient.channel(channelType, channelId, {
      name: `Weight Loss ${userName}`,
      created_by_id: userId,
    });

    // Ensure the channel exists (query will throw if missing)
    try {
      await channel.query();
      console.log(`ℹ️ Channel exists: ${channelId}`);
    } catch (err) {
      // Create channel if it doesn't exist
      await channel.create({ id: channelId });
      console.log(`✅ Channel created: ${channelId}`);
    }
        const doctorName = 'Doctor Sami';

    // Send message
    const response = await channel.sendMessage({
      text: messageText,
      user:{id:userId,name:doctorName}
    });

    console.log(`✅ Message sent to channel "${channelId}"`);
    console.log(`Message: "${messageText}"`);
    console.log(`Message ID: ${response.message.id}`);
    
    return response;
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    throw error;
  }
}


async function sendUserMessageToChannel(channelId, userId,userName, messageText) {
  try {

    // Get or create the channel
    const channel = serverClient.channel(channelType, channelId, {
      name: `Weight Loss ${userName}`,
      created_by_id: userId,
    });

    // Ensure the channel exists (query will throw if missing)
    try {
      await channel.query();
      console.log(`ℹ️ Channel exists: ${channelId}`);
    } catch (err) {
      // Create channel if it doesn't exist
      await channel.create({ id: channelId });
      console.log(`✅ Channel created: ${channelId}`);
    }
 
    // Send message
    const response = await channel.sendMessage({
      text: messageText,
      user:{id:userId,name:userName}
    });

    console.log(`✅ Message sent to channel "${channelId}"`);
    console.log(`Message: "${messageText}"`);
    console.log(`Message ID: ${response.message.id}`);
    
    return response;
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    throw error;
  }
}


/**
 * Main function to demonstrate the complete flow
 */
async function main(userId = 'D0Vf1d6AaRPSGqITkVeL44aQAuF3', message = 'Hello from doctor_main',deviceID ="",userName = 'NA',platform="") {
  try {
    console.log('🚀 Starting GetStream Chat Setup...\n');

    // Names
    const doctorId = 'doctor_main';
    const doctorName = 'Doctor Sami';
    const targetUserId = userId;
 
    // Channel id must NOT include the channel type or a ':' character.
    // Use a deterministic channel id for the doctor<->user DM
    const channelId = `user-${userId}-weight-loss`;

    
    // Step 1: Ensure doctor exists
    console.log('📝 Step 1: Ensuring doctor user exists...');
    await createOrUpdateUser(doctorId, doctorName,"","");
    console.log('');

    // Step 2: Ensure target user exists (create if missing)
    console.log('📝 Step 2: Ensuring target user exists (create if missing)...');
    await createOrUpdateUser(targetUserId, userName,deviceID,platform);
    console.log('');

    // Step 3: Ensure channel exists and both members are present
    console.log('🔧 Step 3: Ensuring channel and members...');
    await ensureChannelWithMembers(channelId,userName, [doctorId, targetUserId], doctorId);
    console.log('');

    // Step 4: Send message from doctor_main to the channel
    console.log('💬 Step 4: Sending message from doctor_main to channel...');
    await sendMessageToChannel(channelId, doctorId,userName, message);
    console.log('');

    // Generate token for doctor (helpful for client-side auth if needed)
    // console.log('🔑 Generating token for doctor_main...');
    // const token = generateUserToken(doctorId);
    // console.log('');

    console.log('✨ Setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - User ID: ${userId}`);
    console.log(`   - User Name: ${userName}`);
    // console.log(`   - Token: ${token}`);
    console.log(`   - Channel: ${channelType}:${channelId}`);
    console.log(`   - Message: "${message}"`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}


// Function to delete all channels
async function deleteAllChannels() {
  try {
    // Query all channels
    const filter = {}; // Empty filter gets all channels
    const sort = [{ last_message_at: -1 }];
    const options = { limit: 30 };

    let hasMore = true;
    let deletedCount = 0;

    while (hasMore) {
      // Query channels
      const channels = await serverClient.queryChannels(filter, sort, options);
 console.log(`Total channels length: ${channels.length}`);

         for (const channel1 of channels) {
        console.log(`channel: ${channel1.type}:${channel1.id}`);


         }
      if (channels.length === 0) {
        hasMore = false;
        break;
      }

      // Delete each channel
      for (const channel of channels) {
        await channel.delete();
        console.log(`Deleted channel: ${channel.type}:${channel.id}`);
        deletedCount++;
      }

      // Check if there are more channels
      hasMore = channels.length === options.limit;
      
      // Optional: Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Total channels deleted: ${deletedCount}`);
  } catch (error) {
    console.error('Error deleting channels:', error);
  }
}

 
// Run the main function with CLI args or defaults.
// Usage: `node index.js <targetUserId> "<message>"`
const cliUserId = 'D0Vf1d6AaRPSGqITkVeL44aQAuF14';
const cliMessage = 'Hai Brother, This is Jibin from Dardoc';
const deviceID = "di0Uik7vTriJ2ZFHfMsN17:APA91bFrvrG85LtyMwa_9E_hIqOxO0k1acc1tVAa379HsEwv-3Tl0QIzw-SHeYQjTuc2w3Nc7js6QqgOu2tUIDfA7IZEGX-bFDg43iNyPR-IQHqX5nirjmM"
const platform = "Android"
// main(cliUserId, cliMessage,deviceID,"Jibin C",platform);
main()


  // const cliUserIdiOS = 'QxmOgt9HHvesoPqIEWw9NkB9YUG3';
  // const deviceIDIos = "4591512e898ff5f7409fbf527f757db2d78f082271c07f844a5fb3f4a2f06863"
  //  main(cliUserIdiOS, cliMessage,deviceIDIos,"Adi","iOS");


// Export functions for use in other files
export { createOrUpdateUser, generateUserToken, sendMessageToChannel };

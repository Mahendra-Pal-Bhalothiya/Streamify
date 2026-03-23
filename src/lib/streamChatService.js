// frontend/src/services/streamChatService.js
import { StreamChat } from 'stream-chat';
import { getStreamToken } from '../lib/api'; // Use your existing function

class StreamChatService {
  constructor() {
    this.client = null;
    this.user = null;
    this.isConnecting = false;
    this.connectionPromise = null;
  }

  /**
   * Initialize Stream Chat client and connect user
   * @param {Object} userData - User data from your app
   * @returns {Promise<StreamChat>} - Connected Stream Chat client
   */
  async initialize(userData) {
    // Prevent multiple simultaneous initialization attempts
    if (this.isConnecting) {
      return this.connectionPromise;
    }

    // If already connected with same user, return existing client
    if (this.client && this.user?.id === userData.id) {
      console.log('Already connected with same user');
      return this.client;
    }

    this.isConnecting = true;
    this.connectionPromise = this._initializeChat(userData);

    try {
      const client = await this.connectionPromise;
      return client;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  /**
   * Private method to handle actual initialization
   */
  async _initializeChat(userData) {
    try {
      // Validate user data has ID
      if (!userData || !userData.id) {
        throw new Error('User data must contain an id field');
      }

      console.log('Initializing Stream Chat for user:', userData.id);

      // Use your existing getStreamToken function
      const { token, apiKey } = await getStreamToken(userData.id);

      if (!token || !apiKey) {
        throw new Error('Invalid response from server: missing token or apiKey');
      }

      // Initialize Stream client
      this.client = StreamChat.getInstance(apiKey);
      
      // Connect user
      await this.client.connectUser(userData, token);
      this.user = userData;

      console.log('Stream Chat initialized successfully');
      
      // Set up connection event listeners
      this._setupEventListeners();

      return this.client;

    } catch (error) {
      console.error('Stream Chat initialization error:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners for connection state
   */
  _setupEventListeners() {
    if (!this.client) return;

    this.client.on('connection.changed', (event) => {
      console.log('Connection state changed:', event);
    });

    this.client.on('connection.recovered', () => {
      console.log('Connection recovered');
    });

    this.client.on('connection.error', (error) => {
      console.error('Connection error:', error);
    });
  }

  /**
   * Disconnect user from Stream Chat
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.disconnectUser();
        this.client = null;
        this.user = null;
        console.log('User disconnected from Stream Chat');
      } catch (error) {
        console.error('Error disconnecting from Stream Chat:', error);
      }
    }
  }

  /**
   * Check if chat is initialized
   */
  isInitialized() {
    return !!(this.client && this.user);
  }

  /**
   * Get Stream Chat client instance
   */
  getClient() {
    return this.client;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Create a new channel
   */
  async createChannel(members, type = 'messaging', customData = {}) {
    if (!this.client) {
      throw new Error('Chat not initialized. Call initialize() first.');
    }

    try {
      // Ensure all member IDs are strings
      const memberIds = members.map(m => m.toString());

      // Generate channel ID
      const channelId = customData.id || `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const channel = this.client.channel(type, channelId, {
        members: memberIds,
        created_by_id: this.user.id,
        ...customData,
        name: customData.name || `Chat with ${memberIds.join(', ')}`
      });

      await channel.watch();
      return channel;

    } catch (error) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  }

  /**
   * Get or create a direct message channel
   */
  async getOrCreateDirectMessageChannel(otherUserId) {
    if (!this.client) {
      throw new Error('Chat not initialized');
    }

    const otherUserIdStr = otherUserId.toString();
    
    // Sort member IDs to ensure consistent channel ID
    const members = [this.user.id, otherUserIdStr].sort();
    
    // Check if channel already exists
    const filter = {
      type: 'messaging',
      members: { $eq: members }
    };

    const channels = await this.client.queryChannels(filter, {}, { limit: 1 });
    
    if (channels.length > 0) {
      return channels[0];
    }

    // Create new channel if doesn't exist
    return this.createChannel(
      members,
      'messaging',
      { 
        name: `Chat between ${this.user.id} and ${otherUserIdStr}`,
        member_count: 2
      }
    );
  }

  /**
   * Query user's channels
   */
  async getUserChannels(filters = {}) {
    if (!this.client) {
      throw new Error('Chat not initialized');
    }

    const defaultFilters = {
      type: 'messaging',
      members: { $in: [this.user.id] }
    };

    const queryFilters = { ...defaultFilters, ...filters };
    
    return this.client.queryChannels(queryFilters, {
      last_message_at: -1  // Sort by most recent message
    }, {
      watch: true,
      state: true
    });
  }
}

// Create and export singleton instance
const streamChatService = new StreamChatService();
export default streamChatService;
// frontend/src/hooks/useStreamChat.js
import { useState, useEffect, useCallback } from 'react';
import streamChatService from '../lib/streamChatService';

export function useStreamChat(user) {
  const [client, setClient] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Initialize chat when user changes
  useEffect(() => {
    let mounted = true;

    const initChat = async () => {
      if (!user) {
        setConnectionStatus('no-user');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setConnectionStatus('connecting');

        // Validate user has ID before initializing
        const userId = user.id || user._id || user.userId;
        if (!userId) {
          throw new Error('User object must contain an id field');
        }

        // Prepare user data with proper ID
        const userWithId = {
          id: userId.toString(),
          name: user.name || user.username || user.email?.split('@')[0] || 'User',
          image: user.avatar || user.profilePicture,
          email: user.email
        };

        const chatClient = await streamChatService.initialize(userWithId);
        
        if (mounted) {
          setClient(chatClient);
          setConnectionStatus('connected');
          
          // Load user channels
          await loadChannels(chatClient);
        }

      } catch (err) {
        if (mounted) {
          setError(err.message);
          setConnectionStatus('error');
          console.error('Chat initialization error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initChat();

    // Cleanup
    return () => {
      mounted = false;
    };
  }, [user]);

  // Load channels
  const loadChannels = useCallback(async (chatClient = client) => {
    if (!chatClient) return;

    try {
      const userChannels = await streamChatService.getUserChannels();
      setChannels(userChannels);
      
      // Set first channel as active if none selected
      if (userChannels.length > 0 && !activeChannel) {
        setActiveChannel(userChannels[0]);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
    }
  }, [client, activeChannel]);

  // Create a new channel
  const createChannel = useCallback(async (members, type = 'messaging', customData = {}) => {
    try {
      setLoading(true);
      const channel = await streamChatService.createChannel(members, type, customData);
      await loadChannels(); // Refresh channel list
      setActiveChannel(channel);
      return channel;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadChannels]);

  // Create or get DM channel
  const getOrCreateDM = useCallback(async (otherUserId) => {
    try {
      setLoading(true);
      const channel = await streamChatService.getOrCreateDirectMessageChannel(otherUserId);
      await loadChannels();
      setActiveChannel(channel);
      return channel;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadChannels]);

  // Send a message
  const sendMessage = useCallback(async (text, attachments = []) => {
    if (!activeChannel) {
      throw new Error('No active channel');
    }

    try {
      const message = await activeChannel.sendMessage({
        text,
        attachments
      });
      return message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeChannel]);

  // Disconnect
  const disconnect = useCallback(async () => {
    await streamChatService.disconnect();
    setClient(null);
    setChannels([]);
    setActiveChannel(null);
    setConnectionStatus('disconnected');
  }, []);

  return {
    client,
    channels,
    activeChannel,
    setActiveChannel,
    loading,
    error,
    connectionStatus,
    createChannel,
    getOrCreateDM,
    sendMessage,
    disconnect,
    isInitialized: streamChatService.isInitialized()
  };
}
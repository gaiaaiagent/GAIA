import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import _ from 'lodash';

const EnhancedRoomViewer = () => {
  const [memories, setMemories] = useState([]);
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [roomOptions, setRoomOptions] = useState([]);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await window.fs.readFile('df_memories.csv', { encoding: 'utf8' });
        const parsed = Papa.parse(response, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });

        const data = parsed.data;
        setMemories(data);

        // Get unique sources and add 'all' option
        const uniqueSources = _.uniq(data.map(d => d.source));
        setSources(['all', ...uniqueSources]);

        // Process room options
        const processedRooms = processRoomOptions(data);
        setRoomOptions(processedRooms);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Process rooms - consolidate Twitter rooms by agent
  const processRoomOptions = (data) => {
    const rooms = data.reduce((acc, item) => {
      const isTwitter = item.source === 'twitter';
      const key = isTwitter ? `twitter-${item.agent_name}` : item.roomId;

      if (!acc[key]) {
        acc[key] = {
          id: key,
          source: item.source,
          agent: item.agent_name,
          preview: item.text?.substring(0, 50) + '...',
          label: isTwitter
            ? `Twitter - ${item.agent_name}`
            : `${item.source} - ${item.text?.substring(0, 50)}...`
        };
      }
      return acc;
    }, {});

    return Object.values(rooms);
  };

  // Filter rooms based on selected source
  const filteredRooms = roomOptions.filter(room =>
    selectedSource === 'all' || room.source === selectedSource
  );

  // Get messages for selected room
  const getMessages = () => {
    if (!selectedRoom) return [];

    const isTwitterRoom = selectedRoom.startsWith('twitter-');
    let filteredMemories;

    if (isTwitterRoom) {
      const agentName = selectedRoom.split('twitter-')[1];
      filteredMemories = memories.filter(m =>
        m.source === 'twitter' && m.agent_name === agentName
      );
    } else {
      filteredMemories = memories.filter(m => m.roomId === selectedRoom);
    }

    return _.orderBy(filteredMemories, ['createdAt'], ['asc']);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="block text-sm font-medium mb-1">Source</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              {sources.map(source => (
                <option key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="w-2/3">
            <label className="block text-sm font-medium mb-1">Room</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              <option value="">Select a room...</option>
              {filteredRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {selectedRoom ? (
            <div className="h-[600px] overflow-y-auto p-4">
              {getMessages().map((message, idx) => (
                <div key={idx} className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="font-medium">
                      {message.user_name || message.agent_name}
                    </span>
                    <span>
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-800">
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Select a room to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedRoomViewer;

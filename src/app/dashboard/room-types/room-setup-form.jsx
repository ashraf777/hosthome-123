import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Edit, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const RoomSetupForm = ({
  livingRooms: initialLivingRooms = 1,
  bathrooms: initialBathrooms = 1,
  rooms: initialRooms = [{ name: 'Room 1', beds: { 'Queen Bed': 1 } }],
  onChange
}) => {
  const [bedTypes, setBedTypes] = useState([]);
  const [loadingBeds, setLoadingBeds] = useState(true);
  const { toast } = useToast();

  const [livingRooms, setLivingRooms] = useState(initialLivingRooms);
  const [bathrooms, setBathrooms] = useState(initialBathrooms);
  const [rooms, setRooms] = useState(initialRooms);
  const [editingRoomIndex, setEditingRoomIndex] = useState(0);

  useEffect(() => {
    const fetchBedTypes = async () => {
      try {
        setLoadingBeds(true);
        const response = await api.get('bed-type-references');
        const data = response.data || response;
        if (Array.isArray(data)) {
          setBedTypes(data);
        } else {
          setBedTypes([]);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Bed types could not be loaded correctly.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching bed types",
          description: error.message || "An unknown error occurred.",
        });
      } finally {
        setLoadingBeds(false);
      }
    };

    fetchBedTypes();
  }, [toast]);

  useEffect(() => {
    setLivingRooms(initialLivingRooms);
    setBathrooms(initialBathrooms);
    setRooms(initialRooms);
  }, [initialLivingRooms, initialBathrooms, initialRooms]);

  const handleLivingRoomsChange = (change) => {
    const newValue = Math.max(0, livingRooms + change);
    setLivingRooms(newValue);
    triggerOnChange(newValue, bathrooms, rooms);
  };

  const handleBathroomsChange = (change) => {
    const newValue = Math.max(1, bathrooms + change);
    setBathrooms(newValue);
    triggerOnChange(livingRooms, newValue, rooms);
  };

  const addRoom = () => {
    const newRooms = [
      ...rooms,
      { name: `Room ${rooms.length + 1}`, beds: {} },
    ];
    setRooms(newRooms);
    setEditingRoomIndex(rooms.length);
    triggerOnChange(livingRooms, bathrooms, newRooms);
  };

  const removeRoom = (index) => {
    if (rooms.length <= 1) return; 
    const newRooms = rooms.filter((_, i) => i !== index);
    setRooms(newRooms);
    if (editingRoomIndex >= newRooms.length) {
      setEditingRoomIndex(newRooms.length - 1);
    }
    triggerOnChange(livingRooms, bathrooms, newRooms);
  };

  const updateBedCount = (roomIndex, bedType, change) => {
    const newRooms = [...rooms];
    const currentBeds = newRooms[roomIndex].beds;
    const currentCount = currentBeds[bedType] || 0;
    const newCount = Math.max(0, currentCount + change);

    if (newCount > 0) {
      currentBeds[bedType] = newCount;
    } else {
      delete currentBeds[bedType];
    }

    setRooms(newRooms);
    triggerOnChange(livingRooms, bathrooms, newRooms);
  };
  
  const triggerOnChange = (living, bath, rms) => {
    if (onChange) {
      onChange({ livingRooms: living, bathrooms: bath, rooms: rms });
    }
  };

  const getBedSummary = (beds) => {
    return Object.entries(beds)
      .map(([bed, count]) => `${count} ${bed}`)
      .join(', ');
  };

  const renderEditingContent = () => {
    if (loadingBeds) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {bedTypes.map((bedType) => (
          <div key={bedType.id} className="flex items-center justify-between">
            <Label>{bedType.name}</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => updateBedCount(editingRoomIndex, bedType.name, -1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input type="number" value={rooms[editingRoomIndex]?.beds[bedType.name] || 0} readOnly className="w-16 text-center" />
              <Button type="button" variant="outline" size="icon" onClick={() => updateBedCount(editingRoomIndex, bedType.name, 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
             <div className="mb-4 space-y-2">
                <Label className="font-semibold">Number of Rooms</Label>
                <div className="flex items-center justify-between w-full">
                    <Label htmlFor='living-room-input' className="font-normal">Living Room</Label>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" onClick={() => handleLivingRoomsChange(-1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input id='living-room-input' type="number" value={livingRooms} readOnly className="w-16 text-center" />
                        <Button type="button" variant="outline" size="icon" onClick={() => handleLivingRoomsChange(1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between w-full">
                    <Label htmlFor='bathrooms-input' className="font-normal">Bathroom(s)</Label>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" onClick={() => handleBathroomsChange(-1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input id='bathrooms-input' type="number" value={bathrooms} readOnly className="w-16 text-center" />
                        <Button type="button" variant="outline" size="icon" onClick={() => handleBathroomsChange(1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mb-4">
              <Label>Room Arrangements</Label>
              <div className="mt-2 space-y-2">
                {rooms.map((room, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-semibold">{room.name}</p>
                      <p className="text-sm text-gray-500">{getBedSummary(room.beds) || 'No beds selected'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingRoomIndex(index)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {rooms.length > 1 && (
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeRoom(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="button" onClick={addRoom}>Add a new room</Button>
          </div>

          <div>
            {editingRoomIndex !== null && rooms[editingRoomIndex] && (
              <div className="p-4 border rounded-md">
                <h3 className="font-semibold mb-4">Editing: {rooms[editingRoomIndex].name}</h3>
                {renderEditingContent()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomSetupForm;

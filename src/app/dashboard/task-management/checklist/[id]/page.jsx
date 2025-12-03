"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from 'lucide-react';

const initialItems = [
    'Arrange housekeeping cleaning schedule',
    'Hot unit got arrange cleaning?',
    'Make sure office cleaning, maxis rental, mvrifica rental, pvi2, pvi3 rentalco arrange 1 week 1 time',
    'Reply all the airbnb, CD enquiries',
    'Double check which unit haven send check out reminder by CD，need to send after 10pm',
    'Put review for today’s check out guest',
    'Update scarletz google sheet check in list for tomorrow arrival',
    'Update outsome cleaning schedule & Make sure partime schedule all sent to them?',
    'Double check if all today check in guest, check in guide sent and password? Any guest not replied in CD/no whatsapp pls send CI guide in Airbnb.',
    'Arrange maintenance tomorrow’s work for ethanol. Make sure the timing which need to come at 11am need confirm time with guest.',
    'Update royce front desk if guest check-in late, remind them to keep at lobby if they go home. And remind guest if front desk no card , ask guard help to scan the lift to go up and collect card from front desk tomorrow.',
    'Before end shift double check back to back & check out list.',
    'Before end shift double check need to reply booking, com and agoda message.',
    'Before end shift Must check if there is last minute booking received today ? & must update at check out a schedule and check if already arrange for cleaner?(check host platform, OR/review if got last minute boking)',
    'Double check night shift need to double check partime cleaner list is updated most latest one ? Back/check out add latest one?',
    'Double check agile already update in whatsApp group for domsov about tomorrow guest arrival?',
    'Tomorrow’s Cubic guest checkin list update Cubic WhatsApp group.',
    'Make sure outsource and Partime reply their msg and say “OK”',
    'Any Southkey guest check in late?',
    'Update Agile Dormsp group for tomorrow arrival guest.',
];

export default function EditChecklistPage() {
    const [items, setItems] = useState(initialItems);
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim() !== '') {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Create Checklist</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="font-medium">Host Name</label>
                    <Select defaultValue="feel-home">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="feel-home">Feel Home Malaysia Sdn Bhd</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="font-medium">Checklist Name</label>
                    <Input defaultValue="Night shift checklist!" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="font-medium">Property Applied</label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select at least one property" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="agile">Agile, B-02-03</SelectItem>
                            <SelectItem value="beta">Beta, C-05-01</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Item Name</h2>
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <Input value={item} readOnly className="flex-grow" />
                        <Button variant="ghost" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add new item"
                    className="flex-grow"
                />
                <Button onClick={handleAddItem}>+ Add new item</Button>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="secondary">Save</Button>
                <Button variant="destructive">Delete</Button>
            </div>
        </div>
    );
}

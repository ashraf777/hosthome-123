"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Send, User, Home, ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { api as hosthomeApi } from "@/services/api";

export default function InboxPage() {
  const [inboxAccounts, setInboxAccounts] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    fetchInbox();
    
    // Silent auto-refresh for real-time feel
    const intervalId = setInterval(() => {
      silentFetchInbox();
      if (activeBookingRef.current) {
        silentFetchThread(activeBookingRef.current.id);
      }
    }, 8000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Use a ref to track the active booking inside the interval scope
  const activeBookingRef = useRef(activeBooking);
  useEffect(() => {
    activeBookingRef.current = activeBooking;
  }, [activeBooking]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeThread]);

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const res = await hosthomeApi.getInboxMessages();
      setInboxAccounts(res.data || []);
    } catch (error) {
      toast.error("Failed to load inbox");
    } finally {
      setLoading(false);
    }
  };

  const silentFetchInbox = async () => {
    try {
      const res = await hosthomeApi.getInboxMessages();
      setInboxAccounts(res.data || []);
    } catch (error) {
      // ignore silent errors
    }
  };

  const silentFetchThread = async (bookingId) => {
    try {
      const res = await hosthomeApi.getBookingThread(bookingId);
      setActiveThread(res.messages || []);
    } catch (error) {
      // ignore
    }
  };

  const openThread = async (booking) => {
    try {
      setLoadingThread(true);
      setActiveBooking(booking);
      const res = await hosthomeApi.getBookingThread(booking.id);
      setActiveThread(res.messages || []);
    } catch (error) {
      toast.error("Failed to load conversation");
    } finally {
      setLoadingThread(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeBooking) return;

    const channel = activeBooking.external_reservation_id ? "beds24" : "email";

    try {
      const payload = {
        content: newMessage,
        channel: channel,
      };

      const res = await hosthomeApi.sendMessage(activeBooking.id, payload);
      setActiveThread((prev) => [...prev, res]);
      setNewMessage("");
      
      // Keep inbox updated in the background
      fetchInbox();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Unified Inbox</h1>
          <p className="text-sm text-gray-500">Manage guest communications across all channels.</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white border rounded-xl shadow-sm flex">
        {/* Sidebar / Conversation List */}
        <div className={`w-full md:w-1/3 border-r flex flex-col ${activeBooking ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700">Conversations</div>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading inbox...</div>
            ) : inboxAccounts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No active conversations.</div>
            ) : (
              inboxAccounts.map((booking) => {
                const latestMsg = booking.messages && booking.messages.length > 0 ? booking.messages[0] : null;
                const guestName = booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'Unknown Guest';
                
                return (
                  <div
                    key={booking.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${activeBooking?.id === booking.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                    onClick={() => openThread(booking)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-900 truncate pr-2">{guestName}</span>
                      {latestMsg && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {format(new Date(latestMsg.created_at), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {latestMsg && (
                      <p className="text-xs text-gray-600 truncate">
                        {latestMsg.direction === 'outbound' ? 'You: ' : ''}{latestMsg.content}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border">
                        {booking.property?.name || 'Property'}
                      </span>
                      {booking.external_reservation_id && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                          Beds24
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>
        </div>

        {/* Main Conversation Thread */}
        <div className={`w-full md:w-2/3 flex flex-col bg-gray-50/50 ${!activeBooking ? 'hidden md:flex justify-center items-center' : 'flex'}`}>
          {!activeBooking ? (
            <div className="text-center text-gray-500">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveBooking(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {activeBooking.guest?.first_name?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeBooking.guest ? `${activeBooking.guest.first_name} ${activeBooking.guest.last_name}` : 'Unknown Guest'}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Home className="h-3 w-3 mr-1" /> {activeBooking.property?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-gray-500">Check-in: <span className="text-gray-900 font-medium">{format(new Date(activeBooking.check_in_date), 'MMM d')}</span></div>
                  <div className="text-gray-500">Check-out: <span className="text-gray-900 font-medium">{format(new Date(activeBooking.check_out_date), 'MMM d')}</span></div>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                className="flex-1 p-4 overflow-y-auto space-y-4" 
                ref={scrollRef}
              >
                {loadingThread ? (
                  <div className="flex justify-center p-4"><p className="text-sm text-gray-500">Loading messages...</p></div>
                ) : (
                  activeThread?.map((msg) => {
                    const isOutbound = msg.direction === 'outbound';
                    return (
                      <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          isOutbound 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border rounded-bl-none text-gray-800'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div className={`text-[10px] mt-1 text-right ${isOutbound ? 'text-blue-200' : 'text-gray-400'}`}>
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Composer */}
              <div className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 rounded-full bg-gray-100 border-transparent focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white"
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim()} 
                    className="rounded-full h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
                {activeBooking.external_reservation_id && (
                  <p className="text-[10px] text-gray-400 mt-2 text-center">Reply will be sent securely via Beds24 / Channel.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

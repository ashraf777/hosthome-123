"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Pencil, Trash, Save, X, Play, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import { api as hosthomeApi } from "@/services/api";

const TRIGGER_EVENTS = [
  { value: "manual", label: "Manual (Send when I click)" },
  { value: "booking-confirmed", label: "On Booking Confirmation" },
  { value: "pre-check-in", label: "Pre Check-in" },
  { value: "post-check-out", label: "Post Check-out" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRunningAutomations, setIsRunningAutomations] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    trigger_event: "manual",
    offset_hours: 0,
    subject: "",
    body: "",
    is_active: true,
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await hosthomeApi.getMessageTemplates();
      setTemplates(res || []);
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleRunAutomations = async () => {
    try {
      setIsRunningAutomations(true);
      const res = await hosthomeApi.runMessageAutomations();
      toast.success(res?.message || "Automations ran successfully");
    } catch (error) {
      toast.error("Failed to execute automations");
    } finally {
      setIsRunningAutomations(false);
    }
  };

  const handleOpenDialog = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        trigger_event: template.trigger_event,
        offset_hours: template.offset_hours,
        subject: template.subject || "",
        body: template.body,
        is_active: template.is_active,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        trigger_event: "manual",
        offset_hours: 0,
        subject: "",
        body: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.body) {
      toast.error("Name and Body are required");
      return;
    }

    try {
      if (editingTemplate) {
        await hosthomeApi.updateMessageTemplate(editingTemplate.id, formData);
        toast.success("Template updated successfully");
      } else {
        await hosthomeApi.createMessageTemplate(formData);
        toast.success("Template created successfully");
      }
      fetchTemplates();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await hosthomeApi.deleteMessageTemplate(id);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const insertVariable = (variable) => {
    setFormData((prev) => ({
      ...prev,
      body: prev.body + variable,
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Message Templates</h1>
          <p className="text-sm text-gray-500">Manage automated and manual message templates for your guests.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRunAutomations} 
            disabled={isRunningAutomations}
            variant="outline" 
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            {isRunningAutomations ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />} 
            Run Automations Now
          </Button>
          <Button onClick={() => handleOpenDialog()} className="bg-primary text-white hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground p-6">Loading templates...</p>
        ) : templates.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl border text-center border-dashed">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">You have not created any message templates yet.</p>
            <Button onClick={() => handleOpenDialog()} variant="outline">
              Create your first template
            </Button>
          </div>
        ) : (
          templates.map((tpl) => (
            <Card key={tpl.id} className="hover:shadow-md transition-all duration-200 border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-gray-800">{tpl.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tpl.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                         {tpl.is_active ? 'Active' : 'Inactive'}
                       </span>
                       <span className="text-xs uppercase tracking-wider text-gray-500">
                         {tpl.trigger_event.replace(/-/g, ' ')}
                       </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 line-clamp-3 mb-4 h-20">
                  {tpl.body}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(tpl)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(tpl.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Check-in Instructions"
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end pb-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>{formData.is_active ? "Active" : "Inactive"}</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trigger Event</Label>
                <Select
                  value={formData.trigger_event}
                  onValueChange={(val) => setFormData({ ...formData, trigger_event: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_EVENTS.map((evt) => (
                      <SelectItem key={evt.value} value={evt.value}>
                        {evt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.trigger_event !== "manual" && formData.trigger_event !== "booking-confirmed" && (
                <div className="space-y-2">
                  <Label>Hour Offset (e.g. 24 for 1 day before)</Label>
                  <Input
                    type="number"
                    value={formData.offset_hours}
                    onChange={(e) => setFormData({ ...formData, offset_hours: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional, for emails)</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Important regarding your stay at {property_name}"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <Label htmlFor="body">Message Body</Label>
                <div className="flex gap-1">
                  {["{guest_first_name}", "{check_in_date}", "{property_name}"].map((vr) => (
                    <Button key={vr} type="button" variant="outline" size="sm" className="h-6 text-xs px-2 py-0 border-dashed" onClick={() => insertVariable(vr)}>
                      +{vr}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Hi {guest_first_name}, here is your check-in code..."
                className="min-h-[150px] resize-y font-mono text-sm"
              />
              <p className="text-xs text-gray-500">Available variables: {'{guest_first_name}, {guest_last_name}, {property_name}, {unit_name}, {check_in_date}, {check_out_date}, {booking_status}'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

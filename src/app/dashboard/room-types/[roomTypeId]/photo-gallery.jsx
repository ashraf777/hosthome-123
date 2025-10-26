
"use client"

import * as React from "react"
import Image from "next/image"
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, Star, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function PhotoGallery({ roomTypeId }) {
  const [photos, setPhotos] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef(null)
  const { toast } = useToast()

  const fetchPhotos = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get(`room-types/${roomTypeId}/photos`)
      setPhotos(response.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch photos.",
      })
    } finally {
      setLoading(false)
    }
  }, [roomTypeId, toast])

  React.useEffect(() => {
    if (roomTypeId) {
      fetchPhotos()
    }
  }, [roomTypeId, fetchPhotos])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("photo", file)
    
    setUploading(true)
    try {
      await api.post(`room-types/${roomTypeId}/photos`, formData)
      toast({ title: "Success", description: "Photo uploaded successfully." })
      fetchPhotos() // Refresh photos
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "There was a problem uploading your photo.",
      })
    } finally {
      setUploading(false)
      if(fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  }

  const handleDelete = async (photoId) => {
    try {
      await api.delete(`room-types/${roomTypeId}/photos/${photoId}`)
      toast({ title: "Success", description: "Photo deleted successfully." })
      setPhotos(photos.filter((p) => p.id !== photoId))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Failed to delete the photo.",
      })
    }
  }

  const handleSetMain = async (photoId) => {
     try {
      await api.post(`room-types/${roomTypeId}/photos/${photoId}`, { is_main: true });
      toast({ title: "Success", description: "Main photo updated." });
      fetchPhotos();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to set main photo.",
      });
    }
  }

  return (
    <div className="space-y-4">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
        />
        <Button onClick={handleUploadClick} disabled={uploading}>
            {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Photo
        </Button>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative">
              <Image
                src={photo.url}
                alt={photo.caption || "Room photo"}
                width={300}
                height={300}
                className={`aspect-square w-full rounded-lg object-cover ${photo.is_main ? 'border-4 border-primary' : 'border'}`}
                data-ai-hint="hotel room interior"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Delete Photo">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this photo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => handleDelete(photo.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {!photo.is_main && (
                     <Button variant="secondary" size="icon" title="Set as Main Photo" onClick={() => handleSetMain(photo.id)}>
                        <Star className="h-4 w-4" />
                    </Button>
                  )}
              </div>
              {photo.is_main && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Main
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center">
            <p className="text-muted-foreground">No photos yet. Upload the first one!</p>
        </div>
      )}
    </div>
  )
}

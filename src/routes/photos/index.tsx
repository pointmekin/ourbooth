import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { getUserPhotosFn, deleteUserPhotoFn } from '@/server/photos'
import { toast } from "sonner"
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'
import { Download, Trash2, ImageIcon, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/photos/')({
    component: MyPhotosPage,
})

interface Photo {
    id: string
    type: string
    layout: string
    url: string
    thumbnailUrl: string | null
    fileSize: number | null
    createdAt: string
}

function MyPhotosPage() {
    const [photos, setPhotos] = useState<Photo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    
    const { data: session } = authClient.useSession()
    const navigate = useNavigate()

    useEffect(() => {
        if (!session) {
            navigate({ to: '/auth/signin' })
            return
        }
        loadPhotos()
    }, [session])

    const loadPhotos = async () => {
        try {
            setIsLoading(true)
            const result = await getUserPhotosFn()
            if (result.success) {
                setPhotos(result.photos)
            }
        } catch (err: any) {
            console.error("Failed to load photos:", err)
            toast.error("Failed to load photos")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (photoId: string) => {
        if (!confirm("Are you sure you want to delete this photo?")) return

        try {
            setDeletingId(photoId)
            const result = await deleteUserPhotoFn({ data: { photoId } })
            if (result.success) {
                setPhotos(photos.filter(p => p.id !== photoId))
                toast.success("Photo deleted")
            }
        } catch (err: any) {
            console.error("Failed to delete photo:", err)
            toast.error("Failed to delete photo")
        } finally {
            setDeletingId(null)
        }
    }

    const handleDownload = (photo: Photo) => {
        const link = document.createElement('a')
        link.href = photo.url
        link.download = `ourbooth-${photo.id}.${photo.type}`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return ''
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    if (!session) {
        return null // Will redirect
    }

    return (
        <div className="min-h-dvh bg-neutral-950 text-neutral-100 font-sans">
            {/* Header */}
            <AppHeader />

            {/* Page Title */}
            <div className="border-b border-white/5 bg-neutral-950/50">
                <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Photos</h1>
                    <Link to="/create">
                        <Button className="bg-rose-600 hover:bg-rose-500 text-white rounded-full font-semibold px-6">
                            Create New
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p>Loading your photos...</p>
                    </div>
                ) : photos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center mb-6">
                            <ImageIcon className="w-10 h-10 text-neutral-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No photos yet</h2>
                        <p className="text-neutral-500 mb-6 max-w-sm">
                            Create your first photobooth strip and it will appear here.
                        </p>
                        <Link to="/create">
                            <Button className="bg-rose-600 hover:bg-rose-500 text-white rounded-full font-semibold px-8">
                                Create Your First Photo
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-neutral-500 mb-6">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photos.map((photo) => (
                                <div 
                                    key={photo.id}
                                    className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-2/3 relative">
                                        <img 
                                            src={photo.thumbnailUrl || photo.url}
                                            alt={`Photo ${photo.id}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                                onClick={() => handleDownload(photo)}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="bg-white/20 hover:bg-red-500/80 backdrop-blur-sm"
                                                onClick={() => handleDelete(photo.id)}
                                                disabled={deletingId === photo.id}
                                            >
                                                {deletingId === photo.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-neutral-400">
                                                {formatDate(photo.createdAt)}
                                            </span>
                                            <span className="text-neutral-600 uppercase">
                                                {photo.layout}
                                            </span>
                                        </div>
                                        {photo.fileSize && (
                                            <p className="text-[10px] text-neutral-600 mt-1">
                                                {formatFileSize(photo.fileSize)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

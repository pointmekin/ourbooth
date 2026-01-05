import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ExportConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credits: number
  onConfirm: () => void
  isExporting?: boolean
}

export function ExportConfirmDialog({
  open,
  onOpenChange,
  credits,
  onConfirm,
  isExporting = false,
}: ExportConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-neutral-950 border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">
            Export Photo Strip
          </AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-400">
            This will cost <span className="text-white font-semibold">1 Credit</span>.
            You currently have <span className="text-rose-400 font-semibold">{credits} credits</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            className="bg-neutral-800 border-white/10 text-white hover:bg-neutral-700 hover:text-white"
            disabled={isExporting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isExporting || credits < 1}
            className="bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Confirm Export"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

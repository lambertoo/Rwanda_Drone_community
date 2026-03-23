"use client"

import { useState, useEffect, useRef } from "react"
import QRCode from "qrcode"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormQRCodeProps {
  formId: string
  formTitle: string
  onClose: () => void
}

export default function FormQRCode({ formId, formTitle, onClose }: FormQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/forms/public/${formId}`

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      })
    }
  }, [url])

  const downloadQR = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = `${formTitle.replace(/\s+/g, "-").toLowerCase()}-qr.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">QR Code</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} className="rounded-lg border" />
          <p className="text-xs text-muted-foreground mt-3 text-center break-all max-w-[280px]">{url}</p>
          <Button onClick={downloadQR} className="mt-4 w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" /> Download PNG
          </Button>
        </div>
      </div>
    </div>
  )
}

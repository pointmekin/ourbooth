
// @ts-ignore
import GIF from 'gif.js'

export const generateGif = async (
  images: string[], 
  options: { delay?: number; width?: number; height?: number } = {}
): Promise<Blob> => {
  const { delay = 500, width = 400, height = 600 } = options
  
  return new Promise((resolve, reject) => {
    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: '/gif.worker.js'
      })
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
      }

      let loadedImages = 0
      const totalImages = images.length

      images.forEach((imgSrc) => {
        const img = new Image()
        img.onload = () => {
          // Clear canvas for next frame
          ctx.clearRect(0, 0, width, height)
          
          // Calculate scale and position (Object-fit: cover logic)
          const imgRatio = img.width / img.height
          const targetRatio = width / height
          
          let drawWidth, drawHeight, offsetX, offsetY
          
          if (imgRatio > targetRatio) {
              drawHeight = height
              drawWidth = height * imgRatio
              offsetX = -(drawWidth - width) / 2
              offsetY = 0
          } else {
              drawWidth = width
              drawHeight = width / imgRatio
              offsetX = 0
              offsetY = -(drawHeight - height) / 2
          }
          
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
          
          // Add the canvas as a frame (it takes a snapshot)
          gif.addFrame(ctx, { delay, copy: true })
          
          loadedImages++
          if (loadedImages === totalImages) {
            gif.render()
          }
        }
        img.onerror = reject
        img.src = imgSrc
      })
      
      gif.on('finished', (blob: Blob) => {
        resolve(blob)
      })

      gif.on('error', (err: any) => {
        reject(err)
      })

    } catch (err) {
      reject(err)
    }
  })
}

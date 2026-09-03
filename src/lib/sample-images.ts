// Generates high quality offline sample images for instant testing
export function generateSampleArtwork(type: 'fine-art' | 'modern' | 'document'): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  if (type === 'fine-art') {
    // Rich oil painting aesthetic
    canvas.width = 1200
    canvas.height = 1500

    // Background gradient
    const grad = ctx.createRadialGradient(600, 750, 100, 600, 750, 900)
    grad.addColorStop(0, '#3a2b1c')
    grad.addColorStop(0.5, '#1e1610')
    grad.addColorStop(1, '#0c0a08')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1200, 1500)

    // Impasto brush stroke effect
    for (let i = 0; i < 400; i++) {
      ctx.save()
      ctx.translate(Math.random() * 1200, Math.random() * 1500)
      ctx.rotate(Math.random() * Math.PI)
      const r = 80 + Math.random() * 140
      const g = 60 + Math.random() * 90
      const b = 30 + Math.random() * 50
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.1 + Math.random() * 0.25})`
      ctx.beginPath()
      ctx.ellipse(0, 0, 100 + Math.random() * 200, 20 + Math.random() * 40, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // Classical portrait silhouette & gold leaf accents
    ctx.save()
    ctx.beginPath()
    ctx.arc(600, 620, 260, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(215, 170, 110, 0.4)'
    ctx.fill()

    // Inner dramatic lighting
    const innerGrad = ctx.createLinearGradient(450, 450, 750, 750)
    innerGrad.addColorStop(0, '#f2d5a3')
    innerGrad.addColorStop(0.5, '#bd8c54')
    innerGrad.addColorStop(1, '#4a2f1b')
    ctx.fillStyle = innerGrad
    ctx.beginPath()
    ctx.ellipse(600, 650, 180, 240, 0, 0, Math.PI * 2)
    ctx.fill()

    // Museum Label
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px serif'
    ctx.textAlign = 'center'
    ctx.fillText('ARTEI ARCHIVE • NO. 042', 600, 1380)
    ctx.font = '22px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText('Oil on Linen, 1892 • Classical Collection', 600, 1420)
    ctx.restore()

  } else if (type === 'modern') {
    // Vibrant modern abstract
    canvas.width = 1400
    canvas.height = 1400

    ctx.fillStyle = '#111317'
    ctx.fillRect(0, 0, 1400, 1400)

    // Dynamic geometric overlapping shapes with vivid colors
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
    for (let i = 0; i < 35; i++) {
      ctx.save()
      ctx.globalAlpha = 0.75
      ctx.fillStyle = colors[i % colors.length]
      ctx.translate(200 + Math.random() * 1000, 200 + Math.random() * 1000)
      ctx.rotate((Math.PI / 4) * (i % 4) + Math.random() * 0.2)
      ctx.fillRect(-150, -150, 200 + Math.random() * 250, 200 + Math.random() * 250)
      ctx.restore()
    }

    // Bold circular overlay
    ctx.save()
    ctx.lineWidth = 16
    ctx.strokeStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(700, 700, 420, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 44px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('CONTEMPORARY CHROMATICS', 700, 1320)

  } else {
    // Angled Document / Exhibition Catalog page (perfect for testing perspective crop)
    canvas.width = 1600
    canvas.height = 1200

    // Wooden desk background
    const deskGrad = ctx.createLinearGradient(0, 0, 1600, 1200)
    deskGrad.addColorStop(0, '#2d1f14')
    deskGrad.addColorStop(1, '#180f08')
    ctx.fillStyle = deskGrad
    ctx.fillRect(0, 0, 1600, 1200)

    // Slanted paper quad
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetX = 15
    ctx.shadowOffsetY = 25

    ctx.beginPath()
    ctx.moveTo(340, 160)  // Top-left
    ctx.lineTo(1320, 220) // Top-right
    ctx.lineTo(1240, 1020) // Bottom-right
    ctx.lineTo(260, 940)  // Bottom-left
    ctx.closePath()
    ctx.fillStyle = '#f9f6f0'
    ctx.fill()
    ctx.restore()

    // Draw document content transformed
    ctx.save()
    ctx.translate(340, 160)
    ctx.rotate(0.06)

    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 42px serif'
    ctx.fillText('CERTIFICATE OF AUTHENTICITY', 80, 140)

    ctx.font = '24px sans-serif'
    ctx.fillStyle = '#555555'
    ctx.fillText('ARTEI ENTERPRISE INFRASTRUCTURE • ARTWORK REGISTRY', 80, 200)

    ctx.strokeStyle = '#cca355'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(80, 230)
    ctx.lineTo(820, 230)
    ctx.stroke()

    ctx.fillStyle = '#333333'
    ctx.font = '20px serif'
    const lines = [
      'This document certifies that the artwork registered hereunder is registered in the ARTEI CRM.',
      'Medium: Mixed Media on Archival Cotton Canvas',
      'Dimensions: 120 × 90 cm (47.2 × 35.4 in)',
      'Provenance: Private Gallery Collection, London / Geneva',
      'Inventory ID: ART-2026-X99-SCAN'
    ]
    lines.forEach((line, idx) => {
      ctx.fillText(line, 80, 290 + idx * 45)
    })

    // Gold seal stamp
    ctx.beginPath()
    ctx.arc(720, 600, 65, 0, Math.PI * 2)
    ctx.fillStyle = '#c59b27'
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('VERIFIED', 720, 595)
    ctx.fillText('ARTEI', 720, 615)

    ctx.restore()
  }

  return canvas.toDataURL('image/jpeg', 0.92)
}

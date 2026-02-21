/**
 * Generate PWA icons from favicon design.
 * Run: node scripts/generate-icons.mjs
 */
import { writeFileSync } from "node:fs"
import { deflateSync } from "node:zlib"

function crc32(data) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const chunk = new Uint8Array(4 + 4 + data.length + 4)
  const view = new DataView(chunk.buffer)
  view.setUint32(0, data.length)
  for (let i = 0; i < 4; i++) chunk[4 + i] = type.charCodeAt(i)
  chunk.set(data, 8)
  const crcData = chunk.slice(4, 8 + data.length)
  view.setUint32(8 + data.length, crc32(crcData))
  return chunk
}

function createIcon(size) {
  const pixels = new Uint8Array(size * size * 4)
  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.44
  const innerR = size * 0.375

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const dx = x - cx + 0.5
      const dy = y - cy + 0.5
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist <= innerR) {
        // Red moon (#c0392b)
        pixels[idx] = 0xc0
        pixels[idx + 1] = 0x39
        pixels[idx + 2] = 0x2b
        pixels[idx + 3] = 0xff
      } else if (dist <= outerR) {
        // Dark ring (#1a1a2e)
        pixels[idx] = 0x1a
        pixels[idx + 1] = 0x1a
        pixels[idx + 2] = 0x2e
        pixels[idx + 3] = 0xff
      } else {
        pixels[idx + 3] = 0 // transparent
      }
    }
  }

  // Build raw scanlines with filter byte
  const stride = 1 + size * 4
  const rawData = new Uint8Array(size * stride)
  for (let y = 0; y < size; y++) {
    rawData[y * stride] = 0 // no filter
    rawData.set(pixels.subarray(y * size * 4, (y + 1) * size * 4), y * stride + 1)
  }

  const compressed = deflateSync(Buffer.from(rawData))

  // IHDR
  const ihdr = new Uint8Array(13)
  const ihdrView = new DataView(ihdr.buffer)
  ihdrView.setUint32(0, size)
  ihdrView.setUint32(4, size)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // RGBA
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // default filter
  ihdr[12] = 0 // no interlace

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdrChunk = makeChunk("IHDR", ihdr)
  const idatChunk = makeChunk("IDAT", new Uint8Array(compressed))
  const iendChunk = makeChunk("IEND", new Uint8Array(0))

  const png = new Uint8Array(
    signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length
  )
  let off = 0
  png.set(signature, off); off += signature.length
  png.set(ihdrChunk, off); off += ihdrChunk.length
  png.set(idatChunk, off); off += idatChunk.length
  png.set(iendChunk, off)

  return png
}

const icon192 = createIcon(192)
const icon512 = createIcon(512)

writeFileSync("public/icons/icon-192.png", icon192)
writeFileSync("public/icons/icon-512.png", icon512)

console.log(`Generated icon-192.png (${icon192.length} bytes)`)
console.log(`Generated icon-512.png (${icon512.length} bytes)`)

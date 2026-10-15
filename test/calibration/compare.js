// Pixel comparison shared by the calibration spec and its capture script: the count of pixels whose
// RMS channel difference exceeds 8% of full scale (ImageMagick `compare -metric AE -fuzz 8%` agrees
// within its rounding: 998 / 1001, 5147 / 5169, 3 / 3 on the stored cases). Ours is drawn at the
// reference's size from its top-left corner, so a panel that shrank shows as missing pixels.
export const FUZZ = .08

export function differing(page, ours, referenceUrl) {
  return page.evaluate(async ([png, url, fuzz]) => {
    const pixels = async (src, w, h) => {
      const img = await createImageBitmap(await (await fetch(src)).blob())
      const c = new OffscreenCanvas(w ?? img.width, h ?? img.height), g = c.getContext('2d')
      g.drawImage(img, 0, 0)
      return g.getImageData(0, 0, c.width, c.height)
    }
    const ref = await pixels(url)
    const got = await pixels('data:image/png;base64,' + png, ref.width, ref.height)
    const limit = 3 * (fuzz * 255) ** 2
    let n = 0
    for (let i = 0; i < ref.data.length; i += 4) {
      const r = got.data[i] - ref.data[i], g = got.data[i + 1] - ref.data[i + 1], b = got.data[i + 2] - ref.data[i + 2]
      if (r * r + g * g + b * b > limit || got.data[i + 3] < 255) n++
    }
    return n
  }, [ours.toString('base64'), referenceUrl, FUZZ])
}

export interface SplicedImageConfig {
  rows: number;
  columns: number;
  spacing: number;
  format: string;
  quality: number;
  autoSize: boolean;
  maxSize?: number;
}

const calculateOptimalSize = (img: HTMLImageElement, maxSize = 2000): { width: number, height: number } => {
  const { width, height } = img;
  
  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }
  
  const aspectRatio = width / height;
  if (width > height) {
    return {
      width: maxSize,
      height: Math.floor(maxSize / aspectRatio)
    };
  } else {
    return {
      width: Math.floor(maxSize * aspectRatio),
      height: maxSize
    };
  }
};

export const createSplicedImage = async (
  images: File[],
  config: SplicedImageConfig
): Promise<{ blob: Blob, canvas: HTMLCanvasElement }> => {
  const { rows, columns, spacing, format, quality, autoSize, maxSize = 2000 } = config;
  
  const imageUrls: string[] = [];
  
  const loadedImages = await Promise.all(
    images.map((file) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        
        const url = URL.createObjectURL(file);
        imageUrls.push(url);
        img.src = url;
      });
    })
  ).finally(() => {
    window.requestIdleCallback?.(() => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    }) || setTimeout(() => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    }, 1000);
  });

  if (loadedImages.length === 0) {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({ blob, canvas });
        } else {
          const defaultBlob = new Blob([], { type: `image/${format}` });
          resolve({ blob: defaultBlob, canvas });
        }
      }, `image/${format}`, quality / 100);
    });
  }

  let actualRows = rows;
  let actualColumns = columns;
  
  if (rows === 1 && columns === 1 && loadedImages.length > 1) {
    actualRows = 1;
    actualColumns = loadedImages.length;
  }

  const optimizedImages = loadedImages.map(img => {
    const { width, height } = calculateOptimalSize(img, maxSize);
    
    if (width === img.width && height === img.height) {
      return img;
    }
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    
    if (ctx) {
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      const optimizedImg = new Image();
      optimizedImg.src = tempCanvas.toDataURL(`image/${format}`, quality / 100);
      
      return new Promise<HTMLImageElement>((resolve) => {
        optimizedImg.onload = () => resolve(optimizedImg);
        optimizedImg.width = width;
        optimizedImg.height = height;
      });
    }
    
    return img;
  });

  const processedImages = await Promise.all(optimizedImages);

  let maxWidth = 0;
  let maxHeight = 0;

  if (autoSize) {
    const imageDimensions: { width: number; height: number }[] = [];
    
    for (let i = 0; i < processedImages.length; i++) {
      const img = processedImages[i];
      imageDimensions[i] = { width: img.width, height: img.height };
    }

    let totalWidth = 0;
    let totalHeight = 0;
    
    if (actualRows === 1) {
      totalWidth = imageDimensions.reduce((sum, dim) => sum + dim.width, 0);
      maxHeight = Math.max(...imageDimensions.map(dim => dim.height));
      totalHeight = maxHeight;
    } else if (actualColumns === 1) {
      totalHeight = imageDimensions.reduce((sum, dim) => sum + dim.height, 0);
      maxWidth = Math.max(...imageDimensions.map(dim => dim.width));
      totalWidth = maxWidth;
    } else {
      for (const img of processedImages) {
        maxWidth = Math.max(maxWidth, img.width);
        maxHeight = Math.max(maxHeight, img.height);
      }
      
      totalWidth = maxWidth * actualColumns;
      totalHeight = maxHeight * actualRows;
    }
    
    if (spacing > 0) {
      totalWidth += (actualColumns - 1) * spacing;
      totalHeight += (actualRows - 1) * spacing;
    }
    
    const canvas = document.createElement("canvas");
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let x = 0;
    let y = 0;
    let index = 0;
    
    if (actualRows === 1) {
      for (let c = 0; c < Math.min(actualColumns, processedImages.length); c++) {
        const img = processedImages[c];
        ctx.drawImage(img, x, (totalHeight - img.height) / 2);
        x += img.width + (c < actualColumns - 1 ? spacing : 0);
      }
    } else if (actualColumns === 1) {
      for (let r = 0; r < Math.min(actualRows, processedImages.length); r++) {
        const img = processedImages[r];
        ctx.drawImage(img, (totalWidth - img.width) / 2, y);
        y += img.height + (r < actualRows - 1 ? spacing : 0);
      }
    } else {
      for (let r = 0; r < actualRows; r++) {
        x = 0;
        for (let c = 0; c < actualColumns; c++) {
          if (index >= processedImages.length) break;
          
          const img = processedImages[index];
          const cellX = x + (maxWidth - img.width) / 2;
          const cellY = y + (maxHeight - img.height) / 2;
          
          ctx.drawImage(img, cellX, cellY);
          
          x += maxWidth + spacing;
          index++;
        }
        y += maxHeight + spacing;
      }
    }
    
    let targetQuality = quality / 100;
    const maxBlobSize = 5 * 1024 * 1024;
    
    return new Promise<{ blob: Blob, canvas: HTMLCanvasElement }>(async (resolve, reject) => {
      try {
        let blob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob(
            (b) => {
              if (b) res(b);
              else rej(new Error("Failed to create image blob"));
            },
            `image/${format}`,
            targetQuality
          );
        });
        
        if (format === 'jpeg' && blob.size > maxBlobSize) {
          let attempts = 0;
          while (blob.size > maxBlobSize && targetQuality > 0.5 && attempts < 3) {
            targetQuality -= 0.1;
            attempts++;
            
            blob = await new Promise<Blob>((res, rej) => {
              canvas.toBlob(
                (b) => {
                  if (b) res(b);
                  else rej(new Error("Failed to create image blob"));
                },
                `image/${format}`,
                targetQuality
              );
            });
          }
        }
        
        resolve({ blob, canvas });
      } catch (err) {
        reject(err);
      }
    });
  } else {
    if (processedImages.length > 0) {
      maxWidth = processedImages[0].width;
      maxHeight = processedImages[0].height;
    }

    const canvas = document.createElement("canvas");
    const totalWidth = actualColumns * maxWidth + (actualColumns - 1) * spacing;
    const totalHeight = actualRows * maxHeight + (actualRows - 1) * spacing;
    
    canvas.width = totalWidth;
    canvas.height = totalHeight;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const batchSize = 4;
    let index = 0;
    
    for (let batchStart = 0; batchStart < processedImages.length; batchStart += batchSize) {
      const batch = processedImages.slice(batchStart, batchStart + batchSize);
      
      for (const img of batch) {
        const r = Math.floor(index / actualColumns);
        const c = index % actualColumns;
        
        if (r >= actualRows) break;
        
        const x = c * (maxWidth + spacing);
        const y = r * (maxHeight + spacing);
        
        ctx.drawImage(img, x, y, maxWidth, maxHeight);
        
        index++;
      }
      
      if (batchStart + batchSize < processedImages.length) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    let targetQuality = quality / 100;
    const maxBlobSize = 5 * 1024 * 1024;
    
    return new Promise<{ blob: Blob, canvas: HTMLCanvasElement }>(async (resolve, reject) => {
      try {
        let blob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob(
            (b) => {
              if (b) res(b);
              else rej(new Error("Failed to create image blob"));
            },
            `image/${format}`,
            targetQuality
          );
        });
        
        if (format === 'jpeg' && blob.size > maxBlobSize) {
          let attempts = 0;
          while (blob.size > maxBlobSize && targetQuality > 0.5 && attempts < 3) {
            targetQuality -= 0.1;
            attempts++;
            
            blob = await new Promise<Blob>((res, rej) => {
              canvas.toBlob(
                (b) => {
                  if (b) res(b);
                  else rej(new Error("Failed to create image blob"));
                },
                `image/${format}`,
                targetQuality
              );
            });
          }
        }
        
        resolve({ blob, canvas });
      } catch (err) {
        reject(err);
      }
    });
  }
};

export const downloadImage = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const copyImageToClipboard = async (canvas: HTMLCanvasElement): Promise<boolean> => {
  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to create blob from canvas"));
      });
    });

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    
    return true;
  } catch (error) {
    console.error("Error copying image to clipboard:", error);
    
    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            
            const div = document.createElement('div');
            div.contentEditable = 'true';
            div.style.position = 'fixed';
            div.style.opacity = '0';
            div.appendChild(img);
            
            document.body.appendChild(div);
            
            const range = document.createRange();
            range.selectNode(div);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
            
            const success = document.execCommand('copy');
            
            selection?.removeAllRanges();
            document.body.removeChild(div);
            URL.revokeObjectURL(img.src);
            
            return success;
          } catch (fallbackError) {
            console.error("Fallback copy method failed:", fallbackError);
            return false;
          }
        }
        return false;
      });
    } catch (fallbackError) {
      console.error("All copy methods failed:", fallbackError);
      return false;
    }
    
    return false;
  }
};

export const createPreviewLayout = async (
  images: File[],
  config: SplicedImageConfig
): Promise<string> => {
  try {
    const { blob, canvas } = await createSplicedImage(images, config);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error creating preview:", error);
    return "";
  }
};

export interface SplicedImageConfig {
  rows: number;
  columns: number;
  spacing: number;
  format: string;
  quality: number;
  autoSize: boolean;
}

export const createSplicedImage = async (
  images: File[],
  config: SplicedImageConfig
): Promise<{ blob: Blob; canvas: HTMLCanvasElement }> => {
  console.log('createSplicedImage: 开始处理', { 
    图片数量: images.length, 
    配置: config 
  });

  try {
    const { rows, columns, spacing, format, quality, autoSize } = config;

    // 加载所有图片
    const loadedImages = await Promise.all(
      images.map(
        (file) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => {
              console.error('加载图片失败:', file.name, e);
              reject(new Error(`Failed to load image: ${file.name}`));
            };
            img.src = URL.createObjectURL(file);
          })
      )
    );

    console.log('createSplicedImage: 所有图片加载完成', loadedImages.length);

    // 计算画布尺寸
    let canvasWidth = 0;
    let canvasHeight = 0;

    if (images.length === 0) {
      throw new Error("No images to splice");
    }

    if (columns === 1 && rows === 1 && images.length === 1) {
      console.log('createSplicedImage: 使用单图模式');
      // 只使用第一张图片
      const firstImage = loadedImages[0];
      canvasWidth = firstImage.width;
      canvasHeight = firstImage.height;
    } else if (columns === 1) {
      console.log('createSplicedImage: 使用横排模式');
      // 一列多行
      if (autoSize) {
        // 保持原始尺寸
        let maxWidth = 0;
        let totalHeight = 0;

        loadedImages.forEach((img) => {
          maxWidth = Math.max(maxWidth, img.width);
          totalHeight += img.height;
        });

        totalHeight += (loadedImages.length - 1) * spacing;
        canvasWidth = maxWidth;
        canvasHeight = totalHeight;
      } else {
        // 统一尺寸
        const firstImage = loadedImages[0];
        const aspectRatio = firstImage.width / firstImage.height;
        canvasWidth = firstImage.width;
        canvasHeight =
          firstImage.height * loadedImages.length +
          spacing * (loadedImages.length - 1);
      }
    } else {
      console.log('createSplicedImage: 使用网格模式');
      // 网格布局
      if (autoSize) {
        // 保持原始尺寸
        let totalWidth = 0;
        let totalHeight = 0;
        let maxRowHeight = 0;
        let currentRow = 0;
        let currentCol = 0;

        loadedImages.forEach((img, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;

          if (row !== currentRow) {
            totalHeight += maxRowHeight + spacing;
            maxRowHeight = 0;
            currentRow = row;
            currentCol = 0;
          }

          if (currentCol === 0) {
            totalWidth = Math.max(totalWidth, img.width);
          } else {
            totalWidth = Math.max(
              totalWidth,
              img.width + spacing * col
            );
          }

          maxRowHeight = Math.max(maxRowHeight, img.height);
          currentCol++;
        });

        totalHeight += maxRowHeight;
        canvasWidth = totalWidth;
        canvasHeight = totalHeight;
      } else {
        // 统一尺寸
        const firstImage = loadedImages[0];
        canvasWidth =
          firstImage.width * columns +
          spacing * (columns - 1);
        canvasHeight =
          firstImage.height * rows + spacing * (rows - 1);
      }
    }

    console.log('createSplicedImage: 计算画布尺寸', { canvasWidth, canvasHeight });

    // 创建画布
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // 绘制图片
    if (columns === 1 && rows === 1 && images.length === 1) {
      // 单图模式
      const firstImage = loadedImages[0];
      ctx.drawImage(firstImage, 0, 0);
    } else if (columns === 1) {
      // 纵向布局
      let yOffset = 0;

      loadedImages.forEach((img) => {
        let drawWidth = img.width;
        let drawHeight = img.height;

        if (!autoSize) {
          // 统一尺寸
          drawWidth = canvas.width;
          drawHeight = (img.height / img.width) * drawWidth;
        }

        ctx.drawImage(img, 0, yOffset, drawWidth, drawHeight);
        yOffset += drawHeight + spacing;
      });
    } else {
      // 网格布局
      let currentRow = 0;
      let currentCol = 0;
      let maxRowHeight = 0;
      let xOffset = 0;
      let yOffset = 0;

      loadedImages.forEach((img, index) => {
        if (currentCol >= columns) {
          currentCol = 0;
          currentRow++;
          yOffset += maxRowHeight + spacing;
          maxRowHeight = 0;
          xOffset = 0;
        }

        let drawWidth = img.width;
        let drawHeight = img.height;

        if (!autoSize) {
          // 统一尺寸
          drawWidth = canvas.width / columns - spacing;
          drawHeight = (img.height / img.width) * drawWidth;
        }

        ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
        xOffset += drawWidth + spacing;
        maxRowHeight = Math.max(maxRowHeight, drawHeight);
        currentCol++;
      });
    }

    console.log('createSplicedImage: 图片绘制完成');

    // 转换为Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        `image/${format}`,
        format === "png" ? undefined : quality / 100
      );
    });

    console.log('createSplicedImage: Blob创建成功', { 大小: blob.size });
    return { blob, canvas };
  } catch (error) {
    console.error("图片处理过程中出错:", error);
    throw error;
  }
};

export const downloadImage = (blob: Blob, filename: string) => {
  console.log('downloadImage: 开始下载', { filename, blobSize: blob.size });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('downloadImage: 下载完成');
};

export const copyImageToClipboard = async (
  canvas: HTMLCanvasElement
): Promise<boolean> => {
  console.log('copyImageToClipboard: 尝试复制到剪贴板');
  try {
    // 常规方法
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
    console.log('copyImageToClipboard: 转换为blob成功', { size: blob.size });

    if (navigator.clipboard && navigator.clipboard.write) {
      console.log('copyImageToClipboard: 使用Clipboard API');
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      console.log('copyImageToClipboard: 复制成功');
      return true;
    } else {
      console.log('copyImageToClipboard: 不支持Clipboard API，尝试备用方法');
      // 备用方法
      canvas.toBlob(function (blob) {
        try {
          const item = new ClipboardItem({ "image/png": blob! });
          navigator.clipboard.write([item]);
          console.log('copyImageToClipboard: 备用方法复制成功');
        } catch (e) {
          console.error('copyImageToClipboard: 备用方法失败', e);
        }
      });
    }
    return true;
  } catch (error) {
    console.error("复制到剪贴板失败:", error);
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

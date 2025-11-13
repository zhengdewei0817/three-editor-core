# 加载进度回调使用说明

## 功能概述

现在 Editor 支持在加载场景时实时报告加载进度,您可以通过监听 `loadingProgressChanged` 信号来获取加载状态。

## 使用方式

### 1. 监听加载进度信号

```javascript
// 创建 editor 实例
const editor = new Editor(options);

// 监听加载进度变化
editor.signals.loadingProgressChanged.add((progressInfo) => {
  console.log('加载进度:', progressInfo);
  
  // 更新您的自定义 UI
  updateLoadingUI(progressInfo);
});
```

### 2. 进度信息对象结构

`progressInfo` 对象包含以下属性:

```javascript
{
  total: 10,              // 总文件数
  current: 5,             // 当前正在加载的文件索引
  percent: 50,            // 总加载百分比 (0-100)，综合考虑所有文件的加载进度
  status: 'loading',      // 加载状态: 'start' | 'loading' | 'loaded' | 'complete'
  fileName: 'model.glb',  // 当前正在加载的文件名
  filePercent: 30,        // 当前文件的加载百分比 (仅在 status='loading' 时有效)
  fileProgresses: [100, 100, 30, 0, 0, ...] // 每个文件的进度数组
}
```

#### 进度计算说明

- **总进度 (percent)**: 所有文件进度的平均值
  - 例如: 3个文件，进度分别为 100%, 50%, 0%
  - 总进度 = (100 + 50 + 0) / 3 = 50%
- **单文件进度 (filePercent)**: 当前正在加载的文件的下载进度
- **文件进度数组 (fileProgresses)**: 可选，包含每个文件的详细进度

### 3. 加载状态说明

- **start**: 开始加载,此时 `current = 0`, `percent = 0`
- **loading**: 正在加载某个文件
- **loaded**: 某个文件加载完成
- **complete**: 所有文件加载完成,此时 `current = total`, `percent = 100`

## 完整示例

### 示例 1: 基本进度条

```javascript
const editor = new Editor(options);

// 创建进度条 UI
const progressBar = document.getElementById('loading-progress');
const progressText = document.getElementById('loading-text');

editor.signals.loadingProgressChanged.add((progressInfo) => {
  const { total, current, percent, status, fileName, filePercent } = progressInfo;
  
  // 更新总进度条
  progressBar.style.width = `${percent}%`;
  
  // 更新文本
  if (status === 'start') {
    progressText.textContent = '开始加载...';
  } else if (status === 'loading') {
    // 显示总进度和当前文件进度
    const fileProgress = filePercent !== undefined ? ` (${filePercent}%)` : '';
    progressText.textContent = `正在加载: ${fileName}${fileProgress} - 总进度: ${percent}% (${current + 1}/${total})`;
  } else if (status === 'loaded') {
    progressText.textContent = `已加载: ${fileName} - 总进度: ${percent}% (${current}/${total})`;
  } else if (status === 'complete') {
    progressText.textContent = '加载完成!';
    // 可以在这里隐藏进度条
    setTimeout(() => {
      progressBar.parentElement.style.display = 'none';
    }, 1000);
  }
});

// 加载多个文件
const urls = [
  { fileUrl: 'https://example.com/model1.glb', fileName: 'model1.glb' },
  { fileUrl: 'https://example.com/model2.glb', fileName: 'model2.glb' },
  { fileUrl: 'https://example.com/model3.glb', fileName: 'model3.glb' }
];

editor.loader.loadByUrls(urls, { getModel: false });
```

### 示例 2: 使用 Vue/React 组件

#### Vue 示例

```vue
<template>
  <div v-if="loading" class="loading-overlay">
    <div class="progress-container">
      <div class="progress-bar" :style="{ width: `${progress.percent}%` }"></div>
    </div>
    <p>{{ loadingText }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      progress: {
        total: 0,
        current: 0,
        percent: 0,
        status: '',
        fileName: ''
      }
    };
  },
  computed: {
    loadingText() {
      const { status, fileName, current, total, percent, filePercent } = this.progress;
      if (status === 'start') return '开始加载...';
      if (status === 'loading') {
        const fileProgress = filePercent !== undefined ? ` (${filePercent}%)` : '';
        return `正在加载: ${fileName}${fileProgress} - 总进度: ${percent}% (${current + 1}/${total})`;
      }
      if (status === 'loaded') return `已加载: ${fileName} - 总进度: ${percent}% (${current}/${total})`;
      if (status === 'complete') return '加载完成!';
      return '';
    }
  },
  mounted() {
    // 假设 editor 已经初始化
    this.editor.signals.loadingProgressChanged.add((progressInfo) => {
      this.progress = progressInfo;
      this.loading = progressInfo.status !== 'complete';
      
      if (progressInfo.status === 'complete') {
        // 完成后延迟隐藏
        setTimeout(() => {
          this.loading = false;
        }, 1000);
      }
    });
  }
};
</script>
```

#### React 示例

```jsx
import React, { useState, useEffect } from 'react';

function LoadingProgress({ editor }) {
  const [progress, setProgress] = useState({
    total: 0,
    current: 0,
    percent: 0,
    status: '',
    fileName: ''
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleProgress = (progressInfo) => {
      setProgress(progressInfo);
      setVisible(progressInfo.status !== 'complete');
      
      if (progressInfo.status === 'complete') {
        setTimeout(() => {
          setVisible(false);
        }, 1000);
      }
    };

    editor.signals.loadingProgressChanged.add(handleProgress);

    return () => {
      editor.signals.loadingProgressChanged.remove(handleProgress);
    };
  }, [editor]);

  if (!visible) return null;

  const getLoadingText = () => {
    const { status, fileName, current, total, percent, filePercent } = progress;
    if (status === 'start') return '开始加载...';
    if (status === 'loading') {
      const fileProgress = filePercent !== undefined ? ` (${filePercent}%)` : '';
      return `正在加载: ${fileName}${fileProgress} - 总进度: ${percent}% (${current + 1}/${total})`;
    }
    if (status === 'loaded') return `已加载: ${fileName} - 总进度: ${percent}% (${current}/${total})`;
    if (status === 'complete') return '加载完成!';
    return '';
  };

  return (
    <div className="loading-overlay">
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p>{getLoadingText()}</p>
    </div>
  );
}

export default LoadingProgress;
```

### 示例 3: 双进度条显示（总进度 + 当前文件进度）

```javascript
const editor = new Editor(options);

// 创建双进度条 UI
const totalProgressBar = document.getElementById('total-progress');
const fileProgressBar = document.getElementById('file-progress');
const totalProgressText = document.getElementById('total-text');
const fileProgressText = document.getElementById('file-text');

editor.signals.loadingProgressChanged.add((progressInfo) => {
  const { total, current, percent, status, fileName, filePercent } = progressInfo;
  
  // 更新总进度条
  totalProgressBar.style.width = `${percent}%`;
  totalProgressText.textContent = `总进度: ${percent}% (${Math.min(current + 1, total)}/${total} 个文件)`;
  
  // 更新当前文件进度条
  if (status === 'loading' && filePercent !== undefined) {
    fileProgressBar.style.width = `${filePercent}%`;
    fileProgressText.textContent = `当前文件: ${fileName} - ${filePercent}%`;
  } else if (status === 'loaded') {
    fileProgressBar.style.width = '100%';
    fileProgressText.textContent = `${fileName} 加载完成`;
  } else if (status === 'complete') {
    fileProgressBar.style.width = '100%';
    fileProgressText.textContent = '所有文件加载完成!';
  }
});

// 加载文件
const urls = [
  { fileUrl: 'https://example.com/large-model.glb', fileName: 'large-model.glb' },
  { fileUrl: 'https://example.com/small-model.glb', fileName: 'small-model.glb' }
];

editor.loader.loadByUrls(urls, { getModel: false });
```

HTML 结构：
```html
<div class="loading-container">
  <div class="progress-section">
    <div id="total-text">总进度: 0%</div>
    <div class="progress-bar-container">
      <div id="total-progress" class="progress-bar"></div>
    </div>
  </div>
  
  <div class="progress-section">
    <div id="file-text">等待加载...</div>
    <div class="progress-bar-container">
      <div id="file-progress" class="progress-bar file-progress"></div>
    </div>
  </div>
</div>
```

CSS 样式：
```css
.loading-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 400px;
  z-index: 9999;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-section:last-child {
  margin-bottom: 0;
}

.progress-bar-container {
  width: 100%;
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.file-progress {
  background: linear-gradient(90deg, #2196F3, #03A9F4);
}

#total-text, #file-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
```

### 示例 4: 显示每个文件的详细进度列表

```javascript
const editor = new Editor(options);

// 存储文件信息
const fileList = document.getElementById('file-list');
const urls = [
  { fileUrl: 'https://example.com/model1.glb', fileName: 'model1.glb' },
  { fileUrl: 'https://example.com/model2.glb', fileName: 'model2.glb' },
  { fileUrl: 'https://example.com/model3.glb', fileName: 'model3.glb' }
];

// 创建文件列表 UI
urls.forEach((url, index) => {
  const item = document.createElement('div');
  item.className = 'file-item';
  item.id = `file-${index}`;
  item.innerHTML = `
    <div class="file-name">${url.fileName}</div>
    <div class="file-progress-container">
      <div class="file-progress-bar" id="progress-${index}"></div>
    </div>
    <div class="file-status" id="status-${index}">等待中...</div>
  `;
  fileList.appendChild(item);
});

editor.signals.loadingProgressChanged.add((progressInfo) => {
  const { fileProgresses, status, current } = progressInfo;
  
  // 更新每个文件的进度条
  fileProgresses.forEach((progress, index) => {
    const progressBar = document.getElementById(`progress-${index}`);
    const statusText = document.getElementById(`status-${index}`);
    
    if (progressBar && statusText) {
      progressBar.style.width = `${progress}%`;
      
      if (progress === 0) {
        statusText.textContent = '等待中...';
        statusText.className = 'file-status waiting';
      } else if (progress === 100) {
        statusText.textContent = '完成';
        statusText.className = 'file-status completed';
      } else {
        statusText.textContent = `${progress}%`;
        statusText.className = 'file-status loading';
      }
    }
  });
});

// 开始加载
editor.loader.loadByUrls(urls, { getModel: false });
```

### 示例 5: 获取单个文件的详细进度

如果您还需要监听单个文件内部的加载进度(如下载进度),可以传递 `onProgress` 回调:

```javascript
const urls = [
  { fileUrl: 'https://example.com/large-model.glb', fileName: 'large-model.glb' }
];

editor.loader.loadByUrls(
  urls, 
  { getModel: false },
  (fileProgress) => {
    // 单个文件的下载进度
    console.log(`文件 ${fileProgress.fileName} 下载进度: ${fileProgress.percent}%`);
    console.log(`已下载: ${fileProgress.loaded} / ${fileProgress.total} 字节`);
  },
  (error) => {
    console.error('加载失败:', error);
  }
);
```

## API 参考

### editor.signals.loadingProgressChanged

信号,在加载进度变化时触发。

**回调参数:**
- `progressInfo` (Object): 进度信息对象
  - `total` (Number): 总文件数
  - `current` (Number): 当前正在加载的文件索引 (从0开始)
  - `percent` (Number): 总加载百分比 (0-100)，基于所有文件进度的平均值
  - `status` (String): 加载状态 ('start' | 'loading' | 'loaded' | 'complete')
  - `fileName` (String): 当前文件名
  - `filePercent` (Number, 可选): 当前文件的加载百分比 (0-100)，仅在 status='loading' 时有效
  - `fileProgresses` (Array<Number>): 所有文件的进度数组，每项为 0-100 的数值

### editor.loader.loadByUrls(urls, options, onProgress, onError, extraOptions)

加载多个文件的方法。

**参数:**
- `urls` (Array): 文件 URL 数组,每项包含 `fileUrl` 和 `fileName`
- `options` (Object): 加载选项
  - `getModel` (Boolean): 是否返回加载的模型对象
- `onProgress` (Function): 单个文件内部的进度回调
- `onError` (Function): 错误回调
- `extraOptions` (Object): 额外选项

**返回:**
- `Promise<Array>`: 如果 `options.getModel` 为 true,返回加载的模型数组

## 注意事项

1. **精确的进度计算**: 总进度 (`percent`) 是所有文件进度的平均值，而不是简单的文件数量占比
   - 例如: 3个文件，进度分别为 100%, 50%, 0%，则总进度 = 50%
   - 这样能更准确地反映实际加载情况，特别是当文件大小差异较大时

2. **进度追踪机制**: 
   - 使用 Three.js 的 `LoadingManager` 来追踪资源加载
   - 同时监听 XMLHttpRequest 的下载进度事件
   - 某些服务器可能不返回 `Content-Length` 头，导致无法计算精确进度
   - 如果无法获取文件总大小，会显示为 50% 的估计进度

3. **进度回调频率**: 
   - `loadingProgressChanged` 信号会在文件下载过程中触发
   - 实际触发频率取决于网络状况和文件大小
   - 建议在 UI 更新时进行节流(throttle)处理，避免过于频繁的 DOM 操作

4. **空数组处理**:
   - 如果传入空的 URL 数组或 `null`，会立即完成并触发 `complete` 状态
   - 确保在调用前检查文件列表是否有效

5. **多层进度信息**:
   - `percent`: 总进度 (所有文件的平均进度)
   - `filePercent`: 当前文件的下载进度
   - `fileProgresses`: 每个文件的详细进度数组
   - `loaded` / `total`: 已加载和总字节数（仅在 onProgress 回调中）

6. **错误处理**: 
   - 即使某个文件加载失败，加载过程也会继续
   - 失败的文件会被标记为 100% 以便继续计算总进度
   - 建议使用 `onError` 回调来处理错误
   - 网络错误和文件格式错误都会被捕获

7. **支持的文件格式**:
   - 目前主要支持 `.glb` 格式
   - 其他格式会返回错误

8. **性能优化**:
   - 对于大量文件的加载，建议使用虚拟滚动来显示文件列表
   - 可以使用 `requestAnimationFrame` 或节流函数来优化进度条动画
   - 文件会按顺序加载，不是并行加载

9. **用户体验**:
   - 建议在加载完成后适当延迟(如1秒)隐藏进度 UI
   - 可以显示双进度条(总进度 + 当前文件进度)提供更详细的反馈
   - 对于单个大文件，`filePercent` 特别有用，能让用户知道下载进展
   - 显示已加载的字节数可以让用户了解实际下载量

10. **CORS 和服务器配置**:
    - 确保服务器正确配置 CORS 头
    - 服务器应返回 `Content-Length` 头以获得准确的进度信息
    - 对于 CDN 资源，确保启用了进度追踪功能

## CSS 样式示例

```css
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.progress-container {
  width: 300px;
  height: 20px;
  background: #333;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

.loading-overlay p {
  color: white;
  font-size: 16px;
  margin: 0;
}
```


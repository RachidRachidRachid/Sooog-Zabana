/**
 * SOGE ZABANA Drag & Drop Multi-Image Uploader and Compressor
 */
const Uploader = {
    images: [], // Holds base64 files
    maxFiles: 5,
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.7,

    init(containerId, inputId, previewContainerId, onChangeCallback) {
        const container = document.getElementById(containerId);
        const input = document.getElementById(inputId);
        const previewContainer = document.getElementById(previewContainerId);

        if (!container || !input) return;

        this.images = [];
        this.renderPreviews(previewContainer, onChangeCallback);

        // Click selection
        container.addEventListener('click', () => input.click());

        // File selection change
        input.addEventListener('change', (e) => {
            this.handleFiles(e.target.files, previewContainer, onChangeCallback);
            input.value = ''; // Reset input
        });

        // Drag and drop listeners
        ['dragenter', 'dragover'].forEach(eventName => {
            container.addEventListener(eventName, (e) => {
                e.preventDefault();
                container.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');
            }, false);
        });

        container.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleFiles(files, previewContainer, onChangeCallback);
        }, false);
    },

    // Process select files
    async handleFiles(files, previewContainer, onChangeCallback) {
        const fileList = Array.from(files).filter(f => f.type.startsWith('image/'));
        
        for (const file of fileList) {
            if (this.images.length >= this.maxFiles) {
                alert(`Vous pouvez télécharger au maximum ${this.maxFiles} images.`);
                break;
            }
            
            try {
                const compressed = await this.compressImage(file);
                this.images.push(compressed);
            } catch (err) {
                console.error("Compression failure:", err);
            }
        }
        
        this.renderPreviews(previewContainer, onChangeCallback);
    },

    // Canvas Compression Logic
    compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calibrate aspect ratio
                    if (width > height) {
                        if (width > this.maxWidth) {
                            height *= this.maxWidth / width;
                            width = this.maxWidth;
                        }
                    } else {
                        if (height > this.maxHeight) {
                            width *= this.maxHeight / height;
                            height = this.maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Output as JPEG with configurable quality factor
                    const compressedBase64 = canvas.toDataURL('image/jpeg', this.quality);
                    resolve(compressedBase64);
                };
                img.onerror = (e) => reject(e);
            };
            reader.onerror = (e) => reject(e);
        });
    },

    // Render Preview Thumbnails
    renderPreviews(container, onChangeCallback) {
        if (!container) return;
        container.innerHTML = '';

        if (this.images.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
        container.style.gap = '12px';
        container.style.marginTop = '16px';

        this.images.forEach((imgSrc, index) => {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.aspectRatio = '1';
            wrapper.style.borderRadius = 'var(--radius-sm)';
            wrapper.style.overflow = 'hidden';
            wrapper.style.border = '1px solid var(--border)';

            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<span class="material-icons" style="font-size: 16px;">close</span>';
            removeBtn.type = 'button';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '4px';
            removeBtn.style.right = '4px';
            removeBtn.style.background = 'rgba(15, 23, 42, 0.7)';
            removeBtn.style.color = 'white';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.width = '24px';
            removeBtn.style.height = '24px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.display = 'flex';
            removeBtn.style.alignItems = 'center';
            removeBtn.style.justifyContent = 'center';

            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.images.splice(index, 1);
                this.renderPreviews(container, onChangeCallback);
            });

            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
        });

        if (onChangeCallback) onChangeCallback(this.images);
    },

    getImages() {
        return this.images;
    },

    setImages(imgs) {
        this.images = [...imgs];
    }
};
exportStyle = `
.upload-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius-lg);
    padding: 32px;
    text-align: center;
    background: var(--surface);
    cursor: pointer;
    transition: var(--transition);
}
.upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--primary);
    background: var(--primary-soft);
}
`;
// Insert style rules dynamically to style.css or header
const cssEl = document.createElement('style');
cssEl.innerHTML = exportStyle;
document.head.appendChild(cssEl);

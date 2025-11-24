<template>
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center">
        <i class="fas fa-cloud-upload-alt text-blue-500 mr-3"></i>
        CDN File Upload
      </h2>
      <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">Max 25MB</span>
    </div>
    
    <!-- Drop Zone -->
    <div class="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer" :class="{
        'border-blue-400 bg-blue-50': isDragging,
        'hover:border-blue-400 hover:bg-blue-50': !isUploading
      }" @drop="handleDrop" @dragover="handleDragOver" @dragleave="isDragging = false" @click="triggerFileInput">
      <input type="file" ref="fileInput" class="hidden" @change="handleFileSelect" :disabled="isUploading">
      
      <div v-if="!selectedFile && !isUploading">
        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600 mb-2 text-lg">Drag & drop file di sini</p>
        <p class="text-gray-500 mb-4">atau klik untuk memilih file</p>
        <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
          <i class="fas fa-folder-open mr-2"></i>Pilih File
        </button>
      </div>
      
      <!-- File Selected -->
      <div v-else-if="selectedFile && !isUploading" class="text-left">
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <i class="fas fa-file text-blue-500 text-xl mr-3"></i>
              <div>
                <p class="font-semibold text-gray-800">{{ selectedFile.name }}</p>
                <p class="text-sm text-gray-600">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <button @click.stop="removeFile" class="text-red-500 hover:text-red-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Uploading -->
      <div v-else-if="isUploading" class="py-4">
        <i class="fas fa-spinner fa-spin text-blue-500 text-2xl mb-3"></i>
        <p class="text-gray-600 mb-2">Uploading file...</p>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="text-sm text-gray-500 mt-2">{{ Math.round(uploadProgress) }}%</p>
      </div>
    </div>
    
    <!-- Upload Button -->
    <button v-if="selectedFile && !isUploading" @click="uploadFile" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg transition duration-200 mt-6 flex items-center justify-center" :disabled="isUploading">
      <i class="fas fa-upload mr-2"></i>
      Upload ke GitHub CDN
    </button>
    
    <!-- Result -->
    <div v-if="uploadResult" class="mt-6 animate-fade-in">
      <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div class="flex items-center mb-4">
          <i class="fas fa-check-circle text-green-500 text-xl mr-3"></i>
          <h3 class="text-lg font-bold text-gray-800">File Berhasil Diupload!</h3>
        </div>
        
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-gray-600 mb-1 block">URL File:</label>
            <div class="flex items-center">
              <input type="text" :value="uploadResult.data.url" readonly class="flex-1 bg-white border border-gray-300 rounded-l-lg px-4 py-2 text-gray-700 focus:outline-none">
              <button @click="copyToClipboard(uploadResult.data.url)" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg transition duration-200">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600">File ID:</label>
              <p class="text-gray-800 font-semibold">{{ uploadResult.data.id }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Size:</label>
              <p class="text-gray-800 font-semibold">{{ formatFileSize(uploadResult.data.size) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  import { cdnService } from '../services/api.js'
  
  export default {
    name: 'FileUpload',
    emits: ['fileUploaded'],
    data() {
      return {
        selectedFile: null,
        isUploading: false,
        isDragging: false,
        uploadProgress: 0,
        uploadResult: null,
        error: null
      }
    },
    methods: {
      triggerFileInput() {
        if (!this.isUploading) {
          this.$refs.fileInput.click()
        }
      },
      
      handleFileSelect(event) {
        const file = event.target.files[0]
        if (file) {
          this.validateAndSetFile(file)
        }
      },
      
      handleDragOver(event) {
        event.preventDefault()
        this.isDragging = true
      },
      
      handleDrop(event) {
        event.preventDefault()
        this.isDragging = false
        
        const files = event.dataTransfer.files
        if (files.length > 0) {
          this.validateAndSetFile(files[0])
        }
      },
      
      validateAndSetFile(file) {
        // Reset previous state
        this.error = null
        this.uploadResult = null
        
        // Validate file size (25MB)
        if (file.size > 25 * 1024 * 1024) {
          this.error = 'Ukuran file melebihi 25MB'
          return
        }
        
        this.selectedFile = file
      },
      
      removeFile() {
        this.selectedFile = null
        this.$refs.fileInput.value = ''
        this.error = null
        this.uploadResult = null
      },
      
      async uploadFile() {
        if (!this.selectedFile) return
        
        this.isUploading = true
        this.uploadProgress = 0
        this.error = null
        
        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            if (this.uploadProgress < 90) {
              this.uploadProgress += 10
            }
          }, 200)
          
          console.log('🔄 Starting upload process...')
          const result = await cdnService.uploadFile(this.selectedFile)
          
          clearInterval(progressInterval)
          this.uploadProgress = 100
          
          console.log('🎉 Upload completed successfully')
          this.uploadResult = result
          this.$emit('fileUploaded', result)
          
          // Reset after success
          setTimeout(() => {
            this.selectedFile = null
            this.isUploading = false
            this.uploadProgress = 0
            this.$refs.fileInput.value = ''
          }, 2000)
          
        } catch (error) {
          console.error('💥 Upload error:', error)
          this.error = this.getErrorMessage(error)
          this.isUploading = false
          this.uploadProgress = 0
        }
      },
      
      getErrorMessage(error) {
        if (error.response?.data?.message) {
          return error.response.data.message
        }
        
        if (error.code === 'NETWORK_ERROR') {
          return 'Koneksi jaringan bermasalah. Periksa koneksi internet Anda.'
        }
        
        if (error.code === 'TIMEOUT') {
          return 'Request timeout. Coba lagi nanti.'
        }
        
        return 'Upload gagal. Silakan coba lagi.'
      },
      
      formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
      },
      
      copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          // You could add a toast notification here
          console.log('URL copied to clipboard')
        })
      }
    }
  }
</script>

<style scoped>
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

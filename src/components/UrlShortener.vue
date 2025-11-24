<template>
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center">
        <i class="fas fa-link text-green-500 mr-3"></i>
        URL Shortener
      </h2>
      <span class="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">GitHub Gist</span>
    </div>
    
    <div class="space-y-4">
      <!-- URL Input -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">
          <i class="fas fa-globe mr-2"></i>URL Tujuan
        </label>
        <input type="url" v-model="longUrl" placeholder="https://example.com/very-long-url" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition duration-200" :disabled="isCreating">
      </div>
      
      <!-- Custom ID Input -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">
          <i class="fas fa-tag mr-2"></i>Custom ID (Opsional)
        </label>
        <input type="text" v-model="customId" placeholder="my-custom-link" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition duration-200" :disabled="isCreating">
        <p class="text-xs text-gray-500 mt-2">Jika dikosongkan, akan generate ID otomatis</p>
      </div>
      
      <!-- Create Button -->
      <button @click="createShortUrl" :disabled="!longUrl || isCreating" class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition duration-200 flex items-center justify-center">
        <i v-if="isCreating" class="fas fa-spinner fa-spin mr-2"></i>
        <i v-else class="fas fa-compress-alt mr-2"></i>
        {{ isCreating ? 'Memproses...' : 'Buat Short URL' }}
      </button>
    </div>
    
    <!-- Result -->
    <div v-if="shortenResult" class="mt-6 animate-fade-in">
      <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div class="flex items-center mb-4">
          <i class="fas fa-check-circle text-green-500 text-xl mr-3"></i>
          <h3 class="text-lg font-bold text-gray-800">Short URL Berhasil Dibuat!</h3>
        </div>
        
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-gray-600 mb-1 block">Short URL:</label>
            <div class="flex items-center">
              <input type="text" :value="shortenResult.data.short_url" readonly class="flex-1 bg-white border border-gray-300 rounded-l-lg px-4 py-2 text-gray-700 focus:outline-none">
              <button @click="copyToClipboard(shortenResult.data.short_url)" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg transition duration-200">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600">ID:</label>
              <p class="text-gray-800 font-semibold">{{ shortenResult.data.id }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">URL Asli:</label>
              <p class="text-gray-800 font-semibold truncate">{{ shortenResult.data.original_url }}</p>
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
    
    <!-- Recent URLs -->
    <div v-if="recentUrls.length > 0" class="mt-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-3">Recent URLs</h4>
      <div class="space-y-2">
        <div v-for="url in recentUrls" :key="url.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex-1 min-w-0">
            <div class="flex items-center">
              <i class="fas fa-link text-green-500 mr-2"></i>
              <span class="text-sm font-medium text-gray-700">{{ url.id }}</span>
            </div>
            <a :href="url.short_url" target="_blank" class="text-xs text-green-500 hover:text-green-600 truncate block">
              {{ url.short_url }}
            </a>
          </div>
          <button @click="copyToClipboard(url.short_url)" class="text-gray-500 hover:text-gray-700 ml-2">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { shortenerService } from '../services/api.js'
  
  export default {
    name: 'UrlShortener',
    emits: ['urlCreated'],
    data() {
      return {
        longUrl: '',
        customId: '',
        isCreating: false,
        shortenResult: null,
        error: null,
        recentUrls: []
      }
    },
    methods: {
      async createShortUrl() {
        if (!this.longUrl) return
        
        // Validate URL format
        try {
          new URL(this.longUrl)
        } catch (error) {
          this.error = 'URL tidak valid. Pastikan URL dimulai dengan http:// atau https://'
          return
        }
        
        this.isCreating = true
        this.error = null
        
        try {
          console.log('🔄 Creating short URL...')
          const result = await shortenerService.createShortUrl(this.longUrl, this.customId || null)
          this.shortenResult = result
          
          // Add to recent URLs
          this.recentUrls.unshift({
            id: result.data.id,
            short_url: result.data.short_url,
            original_url: result.data.original_url
          })
          
          // Keep only last 5
          if (this.recentUrls.length > 5) {
            this.recentUrls = this.recentUrls.slice(0, 5)
          }
          
          this.$emit('urlCreated', result)
          
          // Reset form
          this.longUrl = ''
          this.customId = ''
          
          console.log('✅ Short URL created successfully')
          
        } catch (error) {
          console.error('💥 Short URL creation error:', error)
          this.error = this.getErrorMessage(error)
        } finally {
          this.isCreating = false
        }
      },
      
      getErrorMessage(error) {
        if (error.response?.data?.message) {
          return error.response.data.message
        }
        
        if (error.code === 'NETWORK_ERROR') {
          return 'Koneksi jaringan bermasalah. Periksa koneksi internet Anda.'
        }
        
        return 'Gagal membuat short URL. Silakan coba lagi.'
      },
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

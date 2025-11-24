<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-cloud text-white text-lg"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">NVXCloud</h1>
              <p class="text-sm text-gray-600">Vue.js Client</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="flex items-center text-sm" :class="apiStatusColor">
              <i class="fas fa-circle mr-2"></i>
              {{ apiStatus }}
            </span>
            <a href="https://nievexsviz.my.id/docs.html" target="_blank" class="text-gray-600 hover:text-blue-500 transition-colors">
              <i class="fas fa-book mr-2"></i>API Docs
            </a>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <div class="container mx-auto px-6 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">
          NVXCloud Vue.js Client
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload file ke GitHub CDN dan buat short URL dengan antarmuka Vue.js yang modern
        </p>
      </div>
      
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="API Status" :value="apiStatus" description="Service health" icon="fas fa-server" icon-bg-color="bg-blue-500" :value-color="apiStatusColor" />
        
        <StatsCard title="Files Uploaded" :value="stats.filesUploaded" description="Total files" icon="fas fa-cloud-upload-alt" icon-bg-color="bg-green-500" value-color="text-green-600" />
        
        <StatsCard title="Short URLs" :value="stats.urlsCreated" description="Total links" icon="fas fa-link" icon-bg-color="bg-purple-500" value-color="text-purple-600" />
        
        <StatsCard title="Storage" value="GitHub" description="Powered by" icon="fas fa-database" icon-bg-color="bg-orange-500" value-color="text-orange-600" />
      </div>
      
      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FileUpload @file-uploaded="onFileUploaded" />
        <UrlShortener @url-created="onUrlCreated" />
      </div>
      
      <!-- Quick Access -->
      <div v-if="recentFiles.length > 0 || recentUrls.length > 0" class="mt-12">
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <i class="fas fa-history text-gray-600 mr-3"></i>
            Recent Activity
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Recent Files -->
            <div v-if="recentFiles.length > 0">
              <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent Files</h3>
              <div class="space-y-3">
                <div v-for="file in recentFiles" :key="file.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center">
                      <i class="fas fa-file text-blue-500 mr-2"></i>
                      <span class="text-sm font-medium text-gray-700 truncate">{{ file.filename }}</span>
                    </div>
                    <a :href="file.url" target="_blank" class="text-xs text-blue-500 hover:text-blue-600 truncate block">
                      {{ file.url }}
                    </a>
                  </div>
                  <button @click="copyToClipboard(file.url)" class="text-gray-500 hover:text-gray-700 ml-2">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Recent URLs -->
            <div v-if="recentUrls.length > 0">
              <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent URLs</h3>
              <div class="space-y-3">
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
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
      <div class="container mx-auto px-6 text-center">
        <div class="flex items-center justify-center mb-4">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <i class="fas fa-cloud text-white"></i>
          </div>
          <h3 class="text-xl font-bold">NVXCloud Vue Client</h3>
        </div>
        <p class="text-gray-400">
          Built with Vue.js 3 • Powered by NVXCloud API
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
  import { healthService } from './services/api.js'
  import StatsCard from './components/StatsCard.vue'
  import FileUpload from './components/FileUpload.vue'
  import UrlShortener from './components/UrlShortener.vue'
  
  export default {
    name: 'App',
    components: {
      StatsCard,
      FileUpload,
      UrlShortener
    },
    data() {
      return {
        apiStatus: 'Checking...',
        stats: {
          filesUploaded: 0,
          urlsCreated: 0
        },
        recentFiles: [],
        recentUrls: []
      }
    },
    computed: {
      apiStatusColor() {
        return this.apiStatus === 'Online' ? 'text-green-600' : 'text-red-600'
      }
    },
    async mounted() {
      await this.checkApiStatus()
      
      // Load from localStorage
      this.loadFromStorage()
    },
    methods: {
      async checkApiStatus() {
        try {
          console.log('🏥 Checking API health...')
          const result = await healthService.checkHealth()
          console.log('✅ API Health:', result)
          this.apiStatus = 'Online'
        } catch (error) {
          console.error('❌ API Health check failed:', error)
          this.apiStatus = 'Offline'
        }
      },
      
      onFileUploaded(result) {
        this.stats.filesUploaded++
        
        // Add to recent files
        this.recentFiles.unshift({
          id: result.data.id,
          filename: result.data.filename,
          url: result.data.url
        })
        
        // Keep only last 5
        if (this.recentFiles.length > 5) {
          this.recentFiles = this.recentFiles.slice(0, 5)
        }
        
        this.saveToStorage()
      },
      
      onUrlCreated(result) {
        this.stats.urlsCreated++
        
        // Add to recent URLs
        this.recentUrls.unshift({
          id: result.data.id,
          short_url: result.data.short_url
        })
        
        // Keep only last 5
        if (this.recentUrls.length > 5) {
          this.recentUrls = this.recentUrls.slice(0, 5)
        }
        
        this.saveToStorage()
      },
      
      copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          console.log('Copied to clipboard:', text)
        })
      },
      
      saveToStorage() {
        const data = {
          stats: this.stats,
          recentFiles: this.recentFiles,
          recentUrls: this.recentUrls
        }
        localStorage.setItem('nvxcloud-vue-data', JSON.stringify(data))
      },
      
      loadFromStorage() {
        const saved = localStorage.getItem('nvxcloud-vue-data')
        if (saved) {
          const data = JSON.parse(saved)
          this.stats = data.stats || this.stats
          this.recentFiles = data.recentFiles || []
          this.recentUrls = data.recentUrls || []
        }
      }
    }
  }
</script>

<style>
  /* Global styles can go here */
</style>

<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-xl">
    <div 
      class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
      :class="iconBgColor"
    >
      <i :class="icon" class="text-white text-xl"></i>
    </div>
    <h3 class="text-lg font-bold text-gray-800 mb-1">{{ title }}</h3>
    <p class="text-2xl font-bold" :class="valueColor">{{ value }}</p>
    <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'StatsCard',
  props: {
    title: String,
    value: [String, Number],
    description: String,
    icon: String,
    iconBgColor: String,
    valueColor: {
      type: String,
      default: 'text-gray-700'
    }
  }
}
</script>
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const route = ref(window.location.pathname)

  function navigate(path: string) {
    window.history.pushState({}, '', path)
    route.value = path
  }

  function initListener() {
    window.addEventListener('popstate', () => {
      route.value = window.location.pathname
    })
  }

  return {
    route,
    navigate,
    initListener,
  }
})

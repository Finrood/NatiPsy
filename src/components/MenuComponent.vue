<template>
  <header :class="[
    'fixed w-full z-50 transition-all duration-300',
    {
        'bg-red-50 bg-opacity-100 shadow-lg': isScrolled,
      'bg-red-50 bg-opacity-100': !isScrolled,
      '-translate-y-full': isHidden
    }
  ]">
    <div class="mx-auto px-4 py-2 mr-20 flex justify-between items-center">
      <a href="/" class="flex items-center" @click.prevent="refreshPage">
        <img src="@/assets/logoo.png" alt="Logo" class="ml-10 h-16 scale-125 w-auto transition-transform duration-300 hover:scale-110">
      </a>
      <nav class="hidden lg:flex space-x-8">
        <a v-for="item in menuItems" :key="item" :href="`#${item}`"
           @click.prevent="scrollToSection(item)"
           class="text-xl font-semibold text-primary-blue hover:text-primary-blue transition-all duration-300 hover:scale-110">
          {{ capitalizeFirstLetter(item) }}
        </a>
      </nav>
      <button class="lg:hidden text-primary-blue" @click="toggleMenu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    </div>
    <transition name="slide-fade">
      <div v-if="isMenuOpen" class="fixed inset-0 bg-primary-pink-dark z-50 lg:hidden">
        <div class="container mx-auto px-4 py-6 flex justify-end">
          <button @click="closeMenu" class="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav class="flex flex-col items-center space-y-8 mt-16">
          <a v-for="item in menuItems" :key="item" :href="`#${item}`"
             @click.prevent="scrollToSection(item)"
             class="text-3xl font-semibold text-white hover:text-primary-blue transition-all duration-300 hover:scale-110">
            {{ capitalizeFirstLetter(item) }}
          </a>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script>
export default {
  name: 'MenuComponent',
  data() {
    return {
      isMenuOpen: false,
      isScrolled: false,
      isHidden: false,
      lastScrollPosition: 0,
      menuItems: ['Início', 'meus Serviços', 'Abordagem', 'Sobre Mim', 'contato']
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    refreshPage() {
      window.location.reload();
    },
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 100; // Adjust this value based on your header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
      this.closeMenu();
    },
    handleScroll() {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

      // Determine scroll direction
      if (currentScrollPosition < 0) {
        return;
      }

      // Check if scrolled more than 200px (increased from 50px)
      this.isScrolled = currentScrollPosition > 200;

      // Only hide the menu if we've scrolled past the initial threshold
      if (this.isScrolled) {
        if (currentScrollPosition > this.lastScrollPosition) {
          this.isHidden = true;  // Scrolling down
        } else {
          this.isHidden = false; // Scrolling up
        }
      } else {
        this.isHidden = false; // Always show when near the top
      }

      this.lastScrollPosition = currentScrollPosition;
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
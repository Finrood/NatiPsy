<template>
  <header :class="[
    'fixed w-full z-50 transition-all duration-300',
    {
      'bg-red-50 bg-opacity-100 shadow-lg': isScrolled,
      'bg-red-50 bg-opacity-100': !isScrolled,
      '-translate-y-full': isHidden
    }
  ]" role="banner">
    <div class="container mx-auto px-4 py-2 flex justify-between items-center">
      <a href="/" class="flex items-center" @click.prevent="refreshPage" aria-label="Home">
        <img src="../assets/logo.png" alt="Company Logo" class="ml-10 h-16 w-auto transform scale-125 transition-transform duration-300 hover:scale-110" loading="lazy">
      </a>
    <nav class="hidden lg:flex space-x-8" aria-label="Main Navigation">
      <a v-for="item in menuItems" :key="item" :href="`#${item}`"
         @click.prevent="scrollToSection(item)"
         class="text-xl font-semibold text-primary-blue hover:text-primary-blue transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
         :aria-label="`Navigate to ${capitalizeFirstLetter(menuDisplayNames[item])} section`">
        {{ capitalizeFirstLetter(menuDisplayNames[item]) }}
      </a>
    </nav>
      <button class="lg:hidden text-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
              @click="toggleMenu"
              aria-expanded="false"
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu">
        <span class="sr-only">Open main menu</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    </div>
    <transition
        enter-active-class="transition-opacity ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity ease-in duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
      <div v-if="isMenuOpen"
           class="fixed inset-0 bg-primary-pink-dark bg-opacity-90 z-50 lg:hidden"
           id="mobile-menu"
           role="dialog"
           aria-modal="true">
        <div class="container mx-auto px-4 py-6 flex justify-end">
          <button @click="closeMenu"
                  class="text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                  aria-label="Close mobile menu">
            <span class="sr-only">Close menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav class="flex flex-col items-center space-y-8 mt-16" aria-label="Mobile Navigation">
          <a v-for="item in menuItems" :key="item" :href="`#${item}`"
             @click.prevent="scrollToSection(item)"
             class="text-3xl font-semibold text-white hover:text-primary-blue transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
             :aria-label="`Navigate to ${capitalizeFirstLetter(item)} section`">
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
      menuItems: ['inicio', 'meus-servicos', 'abordagem', 'vantagens', 'sobre-mim'],
      menuDisplayNames: {
        'inicio': 'inicio',
        'meus-servicos': 'meus servicos',
        'abordagem': 'abordagem',
        'vantagens': 'vantagens',
        'sobre-mim': 'sobre mim'
      }
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      this.$nextTick(() => {
        document.querySelector('button[aria-controls="mobile-menu"]').setAttribute('aria-expanded', this.isMenuOpen);
      });
    },
    closeMenu() {
      this.isMenuOpen = false;
      document.querySelector('button[aria-controls="mobile-menu"]').setAttribute('aria-expanded', 'false');
    },
    refreshPage() {
      window.location.reload();
    },
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });

        history.pushState(null, null, `#${sectionId}`);

        element.tabIndex = -1;
        element.focus({ preventScroll: true });
      }
      this.closeMenu();
    },
    handleScroll() {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScrollPosition < 0) {
        return;
      }

      this.isScrolled = currentScrollPosition > 200;

      if (this.isScrolled) {
        this.isHidden = currentScrollPosition > this.lastScrollPosition;
      } else {
        this.isHidden = false;
      }

      this.lastScrollPosition = currentScrollPosition;
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>